import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TILE_COSTS, TileTerrain } from '@common/enums/tile-terrain.enum';
import { Item } from '@common/interfaces/item';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
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

interface FloodFillValidatorConfig {
    checkForItems?: boolean;
    room: RoomGame;
    startPosition: Vec2;
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

/* Fonction pour trouver la position du joueur/item le plus proche */
export function getNearestPositions(position: Vec2, range: number = 1): Vec2[] {
    const positions: Vec2[] = [];

    for (let x = 0; x >= -range; x--) {
        for (let y = 0; y >= -range; y--) {
            if (x === 0 && y === 0) continue;
            positions.push({ x: position.x + x, y: position.y + y });
        }
    }

    for (let x = 0; x <= range; x++) {
        for (let y = 0; y <= range; y++) {
            if (x === 0 && y === 0) continue;
            positions.push({ x: position.x + x, y: position.y + y });
        }
    }

    return positions;
}

export function getNearestPlayerPosition(room: RoomGame, startPosition: Vec2): Vec2 | null {
    if (!room.players || room.players.length === 0) return null;

    const activePlayers = filterActivePlayers(room.players);
    if (activePlayers.length === 0) return null;

    const priorityQueue: { pos: Vec2; cost: number }[] = [{ pos: startPosition, cost: 0 }];
    const visited = new Set<string>();
    let nearestPlayerPosition: Vec2 | null = null;
    let minimumCost = Infinity;

    while (priorityQueue.length > 0) {
        const current = getNextPosition(priorityQueue);
        if (!current) continue;
        const { pos, cost } = current;

        if (isVisited(pos, visited)) continue;
        markVisited(pos, visited);

        const playerPosition = checkForNearestPlayer(pos, activePlayers);
        if (playerPosition && cost < minimumCost) {
            nearestPlayerPosition = playerPosition;
            minimumCost = cost;
        }

        exploreAdjacentPositions({ pos, cost }, room, priorityQueue);
    }
    return nearestPlayerPosition;
}

export function getNearestItemPosition(room: RoomGame, startPosition: Vec2, items: Item[]): Vec2 | null {
    if (!room.game.map.mapArray || room.game.map.placedItems.length === 0) return null;

    const priorityQueue: { pos: Vec2; cost: number }[] = [{ pos: startPosition, cost: 0 }];
    const visited = new Set<string>();
    let nearestItemPosition: Vec2 | null = null;
    let minimumCost = Infinity;

    while (priorityQueue.length > 0) {
        const current = getNextPosition(priorityQueue);
        if (!current) continue;

        const { pos, cost } = current;

        if (isVisited(pos, visited)) continue;
        markVisited(pos, visited);

        const itemPosition = checkForNearestItem(pos, items);
        if (itemPosition && cost < minimumCost) {
            nearestItemPosition = itemPosition;
            minimumCost = cost;
        }

        exploreAdjacentPositions({ pos, cost }, room, priorityQueue);
    }

    return nearestItemPosition;
}

// Helper function to filter active players
function filterActivePlayers(players: Player[]): Player[] {
    return players.filter((player) => !player.playerInGame.hasAbandoned);
}

// Helper function to retrieve the next position with the lowest cost from the priority queue
function getNextPosition(priorityQueue: { pos: Vec2; cost: number }[]): { pos: Vec2; cost: number } | null {
    if (priorityQueue.length === 0) return null;
    priorityQueue.sort((a, b) => a.cost - b.cost); // Consider optimizing with a priority queue data structure
    return priorityQueue.shift() || null;
}

// Helper function to check if a position has been visited
function isVisited(pos: Vec2, visited: Set<string>): boolean {
    return visited.has(`${pos.x},${pos.y}`);
}

// Helper function to mark a position as visited
function markVisited(pos: Vec2, visited: Set<string>): void {
    visited.add(`${pos.x},${pos.y}`);
}

// General function to check for the nearest entity (player or item) at a given position
function checkForNearestEntity<T>(pos: Vec2, entities: T[], positionExtractor: (entity: T) => Vec2): Vec2 | null {
    for (const entity of entities) {
        const entityPosition = positionExtractor(entity);
        if (entityPosition.x === pos.x && entityPosition.y === pos.y) {
            return entityPosition;
        }
    }
    return null;
}

// Usage for nearest player
function checkForNearestPlayer(pos: Vec2, players: Player[]): Vec2 | null {
    return checkForNearestEntity(pos, players, (player) => player.playerInGame.currentPosition);
}

// Usage for nearest item
function checkForNearestItem(pos: Vec2, items: Item[]): Vec2 | null {
    return checkForNearestEntity(pos, items, (item) => item.position);
}

const DIRECTIONS: Vec2[] = [
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
];

// Helper function to explore adjacent positions and update the priority queue
function exploreAdjacentPositions(current: { pos: Vec2; cost: number }, room: RoomGame, queue: { pos: Vec2; cost: number }[]): void {
    for (const direction of DIRECTIONS) {
        const newPosition = { x: current.pos.x + direction.x, y: current.pos.y + direction.y };

        if (isCoordinateWithinBoundaries(newPosition, room.game.map.mapArray)) {
            const tileType = room.game.map.mapArray[newPosition.y][newPosition.x];
            const moveCost = TILE_COSTS[tileType];

            if (moveCost !== Infinity && !isAnotherPlayerPresentOnTile(newPosition, room.players)) {
                queue.push({ pos: newPosition, cost: current.cost + moveCost });
            }
        }
    }
}

/* export function getNearestPlayerPosition(room: RoomGame, startPosition: Vec2): Vec2 | null {
    if (!room.players || room.players.length === 0) {
        return null;
    }

    // Filter out inactive players
    const activePlayers = room.players.filter((player) => !player.playerInGame.hasAbandoned);

    // Initialize a priority queue for Dijkstra-like traversal
    const priorityQueue: { pos: Vec2; cost: number }[] = [{ pos: startPosition, cost: 0 }];
    const visited = new Set<string>();
    let nearestPlayerPosition: Vec2 | null = null;
    let minimumCost = Infinity;

    while (priorityQueue.length > 0) {
        // Sort by cost (lowest cost first)
        priorityQueue.sort((a, b) => a.cost - b.cost);
        const current = priorityQueue.shift();
        const { pos, cost } = current;
        const key = `${pos.x},${pos.y}`;

        // Avoid revisiting the same position
        if (visited.has(key)) continue;
        visited.add(key);

        // Check if an active player is present on this tile
        for (const player of activePlayers) {
            const playerPosition = player.playerInGame.currentPosition;
            if (playerPosition.x === pos.x && playerPosition.y === pos.y) {
                // Update nearest player if this position is reached at a lower cost
                if (cost < minimumCost) {
                    minimumCost = cost;
                    nearestPlayerPosition = playerPosition;
                }
            }
        }

        const directions: Vec2[] = [
            { x: 0, y: 1 },
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: -1, y: 0 },
        ];

        for (const direction of directions) {
            const newX = pos.x + direction.x;
            const newY = pos.y + direction.y;
            const newPosition = { x: newX, y: newY };

            if (isCoordinateWithinBoundaries(newPosition, room.game.map.mapArray)) {
                const tileType = room.game.map.mapArray[newY][newX];
                const moveCost = TILE_COSTS[tileType];

                if (moveCost !== Infinity && !isAnotherPlayerPresentOnTile(newPosition, room.players)) {
                    priorityQueue.push({ pos: newPosition, cost: cost + moveCost });
                }
            }
        }
    }

    return nearestPlayerPosition;
} */
