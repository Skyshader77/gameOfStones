import { Player } from '@app/interfaces/player';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
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
