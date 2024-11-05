import { Player } from '@app/interfaces/player';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';

export function isAnotherPlayerPresentOnTile(position: Vec2, players: Player[]): boolean {
    return players.some((player) => player.playerInGame.currentPosition.x === position.x && player.playerInGame.currentPosition.y === position.y);
}

export function isCoordinateWithinBoundaries(destination: Vec2, map: TileTerrain[][]): boolean {
    return !(destination.x >= map.length || destination.y >= map[0].length || destination.x < 0 || destination.y < 0);
}
