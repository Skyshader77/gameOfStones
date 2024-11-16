import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
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
