import { directionToVec2Map } from '@app/constants/conversion-consts';
import { Tile, TileTerrain } from '@app/interfaces/map';
import { Direction, ReachableTile } from '@app/interfaces/reachableTiles';
import { Vec2 } from '@app/interfaces/vec2';

const TILE_COSTS: Record<TileTerrain, number> = {
    [TileTerrain.WALL]: Infinity,
    [TileTerrain.ICE]: 0,
    [TileTerrain.GRASS]: 1,
    [TileTerrain.CLOSEDDOOR]: Infinity,
    [TileTerrain.WATER]: 2,
    [TileTerrain.OPENDOOR]: 1,
};

export class Pathfinding {
    static dijkstraReachableTiles(mapArray: Tile[][], start: Vec2, initialSpeed: number): ReachableTile[] {
        const visited = new Set<string>();
        const priorityQueue: { pos: Vec2; remainingSpeed: number; path: Direction[] }[] = [];

        priorityQueue.push({
            pos: start,
            remainingSpeed: initialSpeed,
            path: [],
        });

        const reachableTiles: ReachableTile[] = [];

        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => b.remainingSpeed - a.remainingSpeed);

            const { pos, remainingSpeed, path } = priorityQueue.shift()!;
            const key = `${pos.x},${pos.y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            reachableTiles.push({
                x: pos.x,
                y: pos.y,
                remainingSpeed,
                path,
            });

            for (const direction in directionToVec2Map) {
                const delta = directionToVec2Map[direction as Direction];
                const newX = pos.x + delta.x;
                const newY = pos.y + delta.y;

                if (newY >= 0 && newY < mapArray.length && newX >= 0 && newX < mapArray[0].length) {
                    const neighborTile = mapArray[newY][newX];
                    const moveCost = TILE_COSTS[neighborTile.terrain];

                    if (moveCost !== Infinity && remainingSpeed - moveCost >= 0) {
                        const newRemainingSpeed = remainingSpeed - moveCost;
                        const newPath = [...path, direction as Direction];

                        priorityQueue.push({
                            pos: { x: newX, y: newY },
                            remainingSpeed: newRemainingSpeed,
                            path: newPath,
                        });
                    }
                }
            }
        }

        return reachableTiles;
    }
}
