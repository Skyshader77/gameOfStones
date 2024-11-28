import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { randomInt } from 'crypto';

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
        { x: position.x - 1, y: position.y },
        { x: position.x, y: position.y - 1 },
        { x: position.x, y: position.y + 1 },
        { x: position.x + 1, y: position.y },
    ];
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
        return !isTileUnavailable(position, room.game.map.mapArray, room.players);
    }
}

export function isValidTerrainForItem(position: Vec2, mapArray: TileTerrain[][]) {
    return [TileTerrain.Ice, TileTerrain.Grass, TileTerrain.Water].includes(mapArray[position.y][position.x]);
}

export function isItemOnTile(position: Vec2, map: Map): boolean {
    return map.placedItems.some((item) => item.position.x === position.x && item.position.y === position.y);
}

export function isTileUnavailable(tilePosition: Vec2, mapArray: TileTerrain[][], playerList: Player[]): boolean {
    return mapArray[tilePosition.y][tilePosition.x] === TileTerrain.Wall || mapArray[tilePosition.y][tilePosition.x] === TileTerrain.ClosedDoor
        ? true
        : isAnotherPlayerPresentOnTile(tilePosition, playerList);
}

export function isPlayerHuman(player: Player) {
    return [PlayerRole.Human, PlayerRole.Organizer].includes(player?.playerInfo.role);
}

export function scrambleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomInt(0, i + 1);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
