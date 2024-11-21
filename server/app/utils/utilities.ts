import { ClosestObject } from '@app/interfaces/ai-action';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { ItemType } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TILE_COSTS, TILE_COSTS_AI, TileTerrain } from '@common/enums/tile-terrain.enum';
import { Item } from '@common/interfaces/item';
import { Direction, directionToVec2Map } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';

type PositionCost = { pos: Vec2; cost: number };
interface FloodFillValidatorConfig {
    checkForItems?: boolean;
    room: RoomGame;
    startPosition: Vec2;
}
export function isAnotherPlayerPresentOnTile(position: Vec2, players: Player[]): boolean {
    return players.some(
        (player) =>
            player.playerInGame.currentPosition.x === position.x &&
            player.playerInGame.currentPosition.y === position.y &&
            !player.playerInGame.hasAbandoned,
    );
}

export function isCoordinateWithinBoundaries(destination: Vec2, map: TileTerrain[][]): boolean {
    return !(destination.x >= map.length || destination.y >= map[0].length || destination.x < 0 || destination.y < 0);
}

export function getAdjacentPositions(position: Vec2): Vec2[] {
    return [
        { x: position.x - 1, y: position.y - 1 },
        { x: position.x - 1, y: position.y },
        { x: position.x - 1, y: position.y + 1 },
        { x: position.x, y: position.y - 1 },
        { x: position.x, y: position.y + 1 },
        { x: position.x + 1, y: position.y - 1 },
        { x: position.x + 1, y: position.y },
        { x: position.x + 1, y: position.y + 1 },
    ];
}

export function findNearestValidPosition(config: FloodFillValidatorConfig): Vec2 | null {
    const { room, startPosition, checkForItems = false } = config;
    const queue: Vec2[] = checkForItems ? getAdjacentPositions(startPosition) : [startPosition];
    const visited: Set<string> = new Set();

    while (queue.length > 0) {
        const currentPosition = queue.shift();
        if (!currentPosition) {
            continue;
        }
        const positionKey = `${currentPosition.x},${currentPosition.y}`;

        if (visited.has(positionKey)) {
            continue;
        }
        visited.add(positionKey);

        if (isValidPosition(currentPosition, room, checkForItems)) {
            return currentPosition;
        }

        const adjacentPositions = getAdjacentPositions(currentPosition);
        adjacentPositions.forEach((position: Vec2) => queue.push(position));
    }

    return null;
}

export function isValidPosition(position: Vec2, room: RoomGame, checkForItems: boolean): boolean {
    const isWithinBounds = isCoordinateWithinBoundaries(position, room.game.map.mapArray);

    if (!isWithinBounds) {
        return false;
    }

    if (checkForItems) {
        return (
            isValidTerrainForItem(position, room.game.map.mapArray) &&
            !isItemOnTile(position, room.game.map) &&
            !isAnotherPlayerPresentOnTile(position, room.players)
        );
    } else {
        const tile = room.game.map.mapArray[position.y][position.x];
        return tile !== TileTerrain.ClosedDoor && tile !== TileTerrain.Wall && !isAnotherPlayerPresentOnTile(position, room.players);
    }
}

export function isValidTerrainForItem(position: Vec2, mapArray: TileTerrain[][]) {
    return [TileTerrain.Ice, TileTerrain.Grass, TileTerrain.Water].includes(mapArray[position.y][position.x]);
}

export function isItemOnTile(position: Vec2, map: Map): boolean {
    return map.placedItems.some((item) => item.position.x === position.x && item.position.y === position.y);
}

export function isTakenTile(tilePosition: Vec2, mapArray: TileTerrain[][], playerList: Player[]): boolean {
    return mapArray[tilePosition.y][tilePosition.x] === TileTerrain.Wall || mapArray[tilePosition.y][tilePosition.x] === TileTerrain.ClosedDoor
        ? true
        : playerList.some(
            (player) => player.playerInGame.currentPosition.x === tilePosition.x && player.playerInGame.currentPosition.y === tilePosition.y,
        );
}

export function isPlayerHuman(player: Player) {
    return [PlayerRole.Human, PlayerRole.Organizer].includes(player.playerInfo.role);
}

export function getNearestPlayerPosition(room: RoomGame, startPosition: Vec2): ClosestObject | null {
    const activePlayers = filterActivePlayers(room.players, room.game.currentPlayer);
    if (activePlayers.length === 0) return null;

    return findObject(room, startPosition, (pos) => checkForNearestPlayer(pos, activePlayers));
}

export function getNearestItemPosition(
    room: RoomGame,
    startPosition: Vec2,
    searchedItemTypes?: ItemType[]
): ClosestObject | null {
    const { placedItems } = room.game.map;

    if (placedItems.length === 0) return null;

    return findObject(room, startPosition, (pos) =>
        checkForNearestItem(pos, placedItems, searchedItemTypes)
    );
}

function findObject<T>(room: RoomGame, startPosition: Vec2, checkFunction: (pos: Vec2) => T | null): ClosestObject | null {
    if (!room.game.map.mapArray) return null;

    const priorityQueue: PositionCost[] = [{ pos: startPosition, cost: 0 }];
    const visited = new Set<string>();
    let nearestPosition: Vec2 | null = null;
    let minimumCost = Infinity;

    while (priorityQueue.length > 0) {
        const current = priorityQueue.shift();
        if (!current) continue;

        const { pos, cost } = current;
        const posKey = `${pos.x},${pos.y}`;

        if (visited.has(posKey)) continue;
        visited.add(posKey);

        const foundItem = checkFunction(pos);
        if (foundItem && cost < minimumCost) {
            nearestPosition = pos;
            minimumCost = cost;
        }

        exploreAdjacentPositions({ pos, cost }, room, priorityQueue);
    }

    return { position: nearestPosition, cost: minimumCost };
}

function filterActivePlayers(players: Player[], currentPlayerName: string): Player[] {
    return players.filter((player) => {
        return !player.playerInGame.hasAbandoned && player.playerInfo.userName !== currentPlayerName;
    });
}

function checkForNearestEntity<T>(pos: Vec2, entities: T[], positionExtractor: (entity: T) => Vec2): Vec2 | null {
    for (const entity of entities) {
        const entityPosition = positionExtractor(entity);
        if (entityPosition.x === pos.x && entityPosition.y === pos.y) {
            return entityPosition;
        }
    }
    return null;
}

function checkForNearestPlayer(pos: Vec2, players: Player[]): Vec2 | null {
    return checkForNearestEntity(pos, players, (player) => player.playerInGame.currentPosition);
}

function checkForNearestItem(
    pos: Vec2,
    items: Item[],
    searchedItemTypes?: ItemType[]
): Vec2 | null {
    for (const item of items) {
        const isMatchingType = searchedItemTypes
            ? searchedItemTypes.includes(item.type)
            : item.type !== ItemType.Start;

        if (item.position.x === pos.x && item.position.y === pos.y && isMatchingType) {
            return item.position;
        }
    }
    return null;
}

function exploreAdjacentPositions(current: { pos: Vec2; cost: number }, room: RoomGame, queue: { pos: Vec2; cost: number }[]): void {
    for (const direction of Object.keys(directionToVec2Map)) {
        const delta = directionToVec2Map[direction as Direction];
        const newPosition = { x: current.pos.x + delta.x, y: current.pos.y + delta.y };

        if (isCoordinateWithinBoundaries(newPosition, room.game.map.mapArray)) {
            const tileType = room.game.map.mapArray[newPosition.y][newPosition.x];
            const moveCost = TILE_COSTS_AI[tileType];

            if (moveCost !== Infinity) {
                queue.push({ pos: newPosition, cost: current.cost + moveCost });
            }
        }
    }
}
