import { Tile, TileTerrain } from '@app/interfaces/map';
import { ReachableTile } from '@app/interfaces/reachableTiles';

const TILE_COSTS: Record<TileTerrain, number> = {
    [TileTerrain.WALL]: Infinity, // impassable
    [TileTerrain.ICE]: 0.001,
    [TileTerrain.GRASS]: 0.98,
    [TileTerrain.CLOSEDDOOR]: Infinity, // impassable
    [TileTerrain.WATER]: 2,
    [TileTerrain.OPENDOOR]: 1,
};

export class Pathfinding {
    static dijkstraReachableTiles(mapArray: Tile[][], startX: number, startY: number, initialSpeed: number): ReachableTile[] {
        const rows = mapArray.length;
        const cols = mapArray[0].length;

        const pq: [number, number, number, string[]][] = [[initialSpeed, startX, startY, []]];

        const distances: number[][] = Array.from({ length: rows }, () => Array(cols).fill(-1));
        distances[startX][startY] = initialSpeed;

        const directions: [number, number, string][] = [
            [-1, 0, 'left'],
            [1, 0, 'right'],
            [0, -1, 'up'],
            [0, 1, 'down'],
        ];

        const pathMap: string[][][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => []));

        pathMap[startX][startY] = [];

        while (pq.length > 0) {
            pq.sort((a, b) => b[0] - a[0]);
            const [remainingSpeed, x, y, path] = pq.pop()!;

            if (distances[x][y] > remainingSpeed) continue;

            for (const [dx, dy, direction] of directions) {
                const newX = x + dx;
                const newY = y + dy;

                if (newX >= 0 && newX < rows && newY >= 0 && newY < cols) {
                    const tileType = mapArray[newX][newY].terrain;
                    const movementCost = TILE_COSTS[tileType];

                    if (remainingSpeed >= movementCost) {
                        const newSpeed = remainingSpeed - movementCost;

                        if (newSpeed > distances[newX][newY]) {
                            distances[newX][newY] = newSpeed;
                            pathMap[newX][newY] = [...path, direction];
                            pq.push([newSpeed, newX, newY, [...path, direction]]);
                        }
                    }
                }
            }
        }

        const reachableTiles: ReachableTile[] = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (distances[i][j] >= 0) {
                    reachableTiles.push({
                        x: i,
                        y: j,
                        remainingSpeed: distances[i][j],
                        path: pathMap[i][j],
                    });
                }
            }
        }

        return reachableTiles;
    }
}
