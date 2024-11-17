import { MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { PathfindingService } from '@app/services/dijkstra/dijkstra.service';
import { ItemType } from '@common/enums/item-type.enum';
import { TILE_COSTS, TileTerrain } from '@common/enums/tile-terrain.enum';
import { Direction, directionToVec2Map, MovementServiceOutput, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { isAnotherPlayerPresentOnTile, isPlayerHuman } from '@app/utils/utilities';
@Injectable()
export class PlayerMovementService {
    constructor(
        private dijkstraService: PathfindingService,
        private gameStatsService: GameStatsService,
    ) { }

    calculateShortestPath(room: RoomGame, destination: Vec2, isSeekingPlayers: boolean): any {
        const currentPlayer = this.getCurrentPlayer(room);
        const reachableTiles = this.getReachableTiles(room, currentPlayer, isSeekingPlayers);

        return this.dijkstraService.getOptimalPath(reachableTiles, destination);
    }

    processPlayerMovement(destination: Vec2, room: RoomGame, isSeekingPlayers: boolean): MovementServiceOutput {
        const destinationTile = this.calculateShortestPath(room, destination, isSeekingPlayers);
        const currentPlayer = this.getCurrentPlayer(room);

        const movementResult = this.executePathForPlayer(destinationTile, room, currentPlayer);

        if (this.hasValidPath(movementResult)) {
            this.updateCurrentPlayerPosition(
                movementResult.optimalPath.position,
                room,
                movementResult.optimalPath.remainingMovement
            );
        }
        return movementResult;
    }

    getReachableTiles(room: RoomGame, player: Player, isSeekingPlayers: boolean): ReachableTile[] {
        return isPlayerHuman(player)
            ? this.dijkstraService.dijkstraReachableTiles(room.players, room.game)
            : this.dijkstraService.dijkstraReachableTilesAi(room.players, room.game, isSeekingPlayers);
    }

    executeShortestPathAI(destinationTile: ReachableTile, room: RoomGame): MovementServiceOutput {
        let isOnClosedDoor = false;
        let isOnItem = false;
        let hasTripped = false;
        let isNextToInteractableObject = false;
        let previousPosition: Vec2 | null = null;
        const actualPath: Direction[] = [];
        const currentPlayer = this.getCurrentPlayer(room);
        const currentPosition = { ...currentPlayer.playerInGame.currentPosition };
        let remainingMovement = currentPlayer.playerInGame.attributes.speed;

        for (const direction of destinationTile.path) {
            const delta = directionToVec2Map[direction];
            currentPosition.x += delta.x;
            currentPosition.y += delta.y;

            const tileCost = this.computeTileCostForAI(currentPosition, room);
            isOnClosedDoor = this.isPlayerOnClosedDoor(currentPosition, room);
            isOnItem = this.isPlayerOnItem(currentPosition, room);
            hasTripped = this.isPlayerOnIce(currentPosition, room) && this.hasPlayerTrippedOnIce() && !room.game.isDebugMode;
            if (isOnItem || hasTripped) {
                actualPath.push(direction);
                remainingMovement -= tileCost;
                break;
            }
            if (isOnClosedDoor || isAnotherPlayerPresentOnTile(currentPosition, room.players)) {
                isNextToInteractableObject = true;
                if (previousPosition) {
                    currentPosition.x = previousPosition.x;
                    currentPosition.y = previousPosition.y;
                }
                break;
            }
            if (remainingMovement - tileCost <= 0) {
                remainingMovement = 0;
                break;
            }
            remainingMovement -= tileCost;
            previousPosition = { ...currentPosition };
            actualPath.push(direction);
        }
        destinationTile.path = actualPath;
        destinationTile.position = { ...currentPosition };
        destinationTile.remainingMovement = remainingMovement;
        this.gameStatsService.processMovementStats(room.game.stats, currentPlayer);
        return { optimalPath: destinationTile, hasTripped, isOnItem, isNextToInteractableObject: isNextToInteractableObject };
    }

    computeTileCostForAI(position: Vec2, room: RoomGame) {
        return TILE_COSTS[room.game.map.mapArray[position.y][position.x]];
    }

    executeShortestPath(destinationTile: ReachableTile, room: RoomGame): MovementServiceOutput {
        let hasTripped = false;
        let isOnItem = false;
        const actualPath: Direction[] = [];
        const currentPlayer = this.getCurrentPlayer(room);
        const currentPosition = currentPlayer.playerInGame.currentPosition;
        for (const node of destinationTile.path) {
            const delta = directionToVec2Map[node];
            currentPosition.x = currentPosition.x + delta.x;
            currentPosition.y = currentPosition.y + delta.y;
            actualPath.push(node);
            isOnItem = this.isPlayerOnItem(currentPosition, room);
            hasTripped = this.isPlayerOnIce(currentPosition, room) && this.hasPlayerTrippedOnIce() && !room.game.isDebugMode;
            if (isOnItem || hasTripped) {
                destinationTile.path = actualPath;
                destinationTile.position = currentPosition;
                break;
            }
        }
        this.gameStatsService.processMovementStats(room.game.stats, currentPlayer);
        return { optimalPath: destinationTile, hasTripped, isOnItem, isNextToInteractableObject: false };
    }

    isPlayerOnIce(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.y][node.x] === TileTerrain.Ice;
    }

    isPlayerOnItem(node: Vec2, room: RoomGame): boolean {
        return room.game.map.placedItems.some(
            (item: Item) => item.type !== ItemType.Start && item.position.x === node.x && item.position.y === node.y,
        );
    }

    isPlayerOnClosedDoor(node: Vec2, room: RoomGame): boolean {
        return room.game.map.mapArray[node.y][node.x] === TileTerrain.ClosedDoor;
    }

    hasPlayerTrippedOnIce(): boolean {
        return Math.random() <= MOVEMENT_CONSTANTS.game.slipProbability;
    }

    updateCurrentPlayerPosition(node: Vec2, room: RoomGame, remainingMovement: number) {
        const index = room.players.findIndex((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        if (index !== -1) {
            room.players[index].playerInGame.currentPosition = node;
            room.players[index].playerInGame.remainingMovement = remainingMovement;
        }
    }

    private getCurrentPlayer(room: RoomGame): Player {
        return room.players.find(
            (player: Player) => player.playerInfo.userName === room.game.currentPlayer
        );
    }

    private executePathForPlayer(destinationTile: any, room: RoomGame, player: Player): MovementServiceOutput {
        return isPlayerHuman(player)
            ? this.executeShortestPath(destinationTile, room)
            : this.executeShortestPathAI(destinationTile, room);
    }

    private hasValidPath(movementResult: MovementServiceOutput): boolean {
        return movementResult.optimalPath.path.length > 0;
    }

}
