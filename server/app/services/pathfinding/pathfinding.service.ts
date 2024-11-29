import { MAX_AI_DISPLACEMENT_VALUE } from '@app/constants/virtual-player.constants';
import { ClosestObject } from '@app/interfaces/ai-state';
import { Game } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { ConditionalItemService } from '@app/services/conditional-item/conditional-item.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries, isValidPosition } from '@app/utils/utilities';
import { TILE_COSTS, TILE_COSTS_AI } from '@common/constants/tile.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { Item } from '@common/interfaces/item';
import { Direction, directionToVec2Map, PathfindingInputs, PathNode, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
interface FloodFillValidatorConfig {
    checkForItems?: boolean;
    room: RoomGame;
    startPosition: Vec2;
    isSeekingPlayers?: boolean;
}

interface ExploreAdjacentPositionsInputs {
    current: ReachableTile;
    game: Game;
    queue: ReachableTile[];
    currentPlayer: Player;
    isSeekingPlayers?: boolean;
    players: Player[];
    isVirtualPlayer: boolean;
}
@Injectable()
export class PathFindingService {
    constructor(
        private conditionalItemService: ConditionalItemService,
        private roomManagerService: RoomManagerService,
    ) {}
    dijkstraReachableTilesHuman(players: Player[], game: Game): ReachableTile[] {
        return this.dijkstraReachableTilesAlgo(players, game);
    }

    dijkstraReachableTilesAi(players: Player[], game: Game, isSeekingPlayers: boolean): ReachableTile[] {
        return this.dijkstraReachableTilesAlgo(players, game, {
            isVirtualPlayer: true,
            isSeekingPlayers,
        });
    }

    getOptimalPath(reachableTiles: ReachableTile[], destination: Vec2): ReachableTile | null {
        const targetTile = reachableTiles.find((tile) => tile.position.x === destination.x && tile.position.y === destination.y);
        if (!targetTile) {
            return null;
        }
        return targetTile;
    }

    // TODO too big
    computeReachableTiles(game: Game, inputs: PathfindingInputs = {}): ReachableTile[] {
        const { isVirtualPlayer = false, isSeekingPlayers = false } = inputs;

        const priorityQueue: ReachableTile[] = [
            {
                position: inputs.currentPlayer.playerInGame.currentPosition,
                remainingMovement: isVirtualPlayer ? MAX_AI_DISPLACEMENT_VALUE : inputs.currentPlayer.playerInGame.remainingMovement,
                path: [],
                cost: 0,
            },
        ];

        const reachableTiles: ReachableTile[] = [];
        const visited = new Set<string>();

        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => b.remainingMovement - a.remainingMovement);

            const current = priorityQueue.shift();
            if (!current) continue;
            const key = `${current.position.x},${current.position.y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            reachableTiles.push(current);

            this.exploreAdjacentPositions({
                current,
                game,
                queue: priorityQueue,
                currentPlayer: inputs.currentPlayer,
                players: inputs.players,
                isVirtualPlayer,
                isSeekingPlayers,
            });
        }

        return reachableTiles;
    }

    findNearestObject<T>(startPosition: Vec2, roomGame: RoomGame, checkFunction: (pos: Vec2) => T | null): ClosestObject | null {
        if (!roomGame.game.map.mapArray) return null;
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(roomGame.room.roomCode);
        const result = this.computeReachableTiles(roomGame.game, {
            startPosition,
            isVirtualPlayer: true,
            currentPlayer,
            players: roomGame.players,
            isSeekingPlayers: true,
        });

        const nearestMatch = result.filter((tile) => checkFunction(tile.position) !== null).sort((a, b) => a.cost - b.cost)[0];

        if (nearestMatch) {
            return { position: nearestMatch.position, cost: nearestMatch.cost };
        }

        return null;
    }

    findNearestValidPosition(config: FloodFillValidatorConfig): Vec2 | null {
        const { room, startPosition, checkForItems } = config;
        const closestTile = this.findNearestObject(startPosition, room, (pos) => this.checkPositionValidity(pos, room, checkForItems));
        return closestTile.position;
    }

    getNearestPlayerPosition(room: RoomGame, startPosition: Vec2): ClosestObject | null {
        const activePlayers = this.filterActivePlayers(room.players, room.game.currentPlayer);
        if (activePlayers.length === 0) return null;

        return this.findNearestObject(startPosition, room, (pos) => this.checkForNearestPlayer(pos, activePlayers));
    }

    getNearestItemPosition(room: RoomGame, startPosition: Vec2, searchedItemTypes?: ItemType[]): ClosestObject | null {
        let { placedItems } = room.game.map;
        placedItems = this.filterPlacedItems(placedItems, startPosition);
        if (placedItems.length === 0) return null;

        return this.findNearestObject(startPosition, room, (pos) => this.checkForNearestItem(pos, placedItems, searchedItemTypes));
    }

    // TODO unammed interface
    private dijkstraReachableTilesAlgo(
        players: Player[],
        game: Game,
        options: {
            isVirtualPlayer: boolean;
            isSeekingPlayers?: boolean;
        } = { isVirtualPlayer: false },
    ): ReachableTile[] {
        const { isVirtualPlayer = false, isSeekingPlayers = false } = options;
        const currentPlayer = players.find((player: Player) => player.playerInfo.userName === game.currentPlayer);

        return this.computeReachableTiles(game, {
            currentPlayer,
            isVirtualPlayer,
            isSeekingPlayers,
            players,
        });
    }

    private exploreAdjacentPositions(inputs: ExploreAdjacentPositionsInputs): void {
        for (const direction of Object.keys(directionToVec2Map)) {
            const delta = directionToVec2Map[direction as Direction];
            const newPosition: Vec2 = {
                x: inputs.current.position.x + delta.x,
                y: inputs.current.position.y + delta.y,
            };

            if (isCoordinateWithinBoundaries(newPosition, inputs.game.map.mapArray)) {
                this.addValidTile(inputs, newPosition, direction as Direction);
            }
        }
    }

    private addValidTile(adjacentPosInfo: ExploreAdjacentPositionsInputs, newPosition: Vec2, direction: Direction) {
        const { current, game, queue, currentPlayer, isSeekingPlayers = false, players, isVirtualPlayer } = adjacentPosInfo;

        const movementCostMap = isVirtualPlayer ? TILE_COSTS_AI : TILE_COSTS;
        const neighborTile = game.map.mapArray[newPosition.y][newPosition.x];

        const moveCost = this.conditionalItemService.areSapphireFinsApplied(currentPlayer, neighborTile) ? 0 : movementCostMap[neighborTile];
        const newRemainingMovement = current.remainingMovement - moveCost;
        const newCost = current.cost + moveCost;
        const newTile = {
            position: newPosition,
            cost: newCost,
            remainingMovement: newRemainingMovement,
            path: current.path,
        } as ReachableTile;
        const newPathNode = {
            direction: direction as Direction,
            remainingMovement: newRemainingMovement,
        } as PathNode;

        if (newRemainingMovement >= 0 && this.isValidTile(newPosition, players, isSeekingPlayers)) {
            newTile.path.push(newPathNode);
            queue.push(newTile);
        }
    }

    private isValidTile(newPosition: Vec2, players: Player[], isSeekingPlayers: boolean): boolean {
        return isSeekingPlayers || !isAnotherPlayerPresentOnTile(newPosition, players);
    }

    private filterActivePlayers(players: Player[], currentPlayerName: string): Player[] {
        return players.filter((player) => {
            return !player.playerInGame.hasAbandoned && player.playerInfo.userName !== currentPlayerName;
        });
    }

    private filterPlacedItems(placedItems: Item[], currentPosition: Vec2): Item[] {
        return placedItems.filter((item) => {
            return !(item.position.x === currentPosition.x && item.position.y === currentPosition.y);
        });
    }

    private checkPositionValidity(position: Vec2, room: RoomGame, checkForItems: boolean): Vec2 | null {
        if (isValidPosition(position, room, checkForItems)) {
            return position;
        }

        return null;
    }

    private checkForNearestEntity<T>(pos: Vec2, entities: T[], positionExtractor: (entity: T) => Vec2): Vec2 | null {
        for (const entity of entities) {
            const entityPosition = positionExtractor(entity);
            if (entityPosition.x === pos.x && entityPosition.y === pos.y) {
                return entityPosition;
            }
        }
        return null;
    }

    private checkForNearestPlayer(pos: Vec2, players: Player[]): Vec2 | null {
        return this.checkForNearestEntity(pos, players, (player) => player.playerInGame.currentPosition);
    }

    private checkForNearestItem(pos: Vec2, items: Item[], searchedItemTypes?: ItemType[]): Vec2 | null {
        for (const item of items) {
            const isMatchingType = searchedItemTypes ? searchedItemTypes.includes(item.type) : item.type !== ItemType.Start;

            if (item.position.x === pos.x && item.position.y === pos.y && isMatchingType) {
                return item.position;
            }
        }
        return null;
    }
}
