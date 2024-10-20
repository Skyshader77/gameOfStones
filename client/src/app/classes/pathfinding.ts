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
        const rows = mapArray.length;
        const cols = mapArray[0].length;

        const pq = Pathfinding.initializePriorityQueue(start, initialSpeed);
        const distances = Pathfinding.initializeDistances(rows, cols, start);
        const pathMap = Pathfinding.initializePathMap(rows, cols);

        while (pq.length > 0) {
            Pathfinding.processQueue(pq, mapArray, distances, pathMap, initialSpeed);
        }

        return Pathfinding.buildReachableTiles(distances, pathMap, initialSpeed);
    }

    private static initializePriorityQueue(start: Vec2, initialSpeed: number) {
        return [[0, initialSpeed, start, 0, []]] as [number, number, Vec2, number, Direction[]][];
    }

    private static initializeDistances(rows: number, cols: number, start: Vec2) {
        const distances = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
        distances[start.x][start.y] = 0;
        return distances;
    }

    private static initializePathMap(rows: number, cols: number) {
        return Array.from({ length: rows }, () => Array.from({ length: cols }, () => [] as Direction[]));
    }

    private static processQueue(
        pq: [number, number, Vec2, number, Direction[]][],
        mapArray: Tile[][],
        distances: number[][],
        pathMap: Direction[][][],
        initialSpeed: number,
    ) {
        const directions: [Vec2, Direction][] = Pathfinding.getDirections();

        pq.sort((a, b) => (a[0] === b[0] ? a[3] - b[3] : a[0] - b[0]));

        const [currentCost, remainingSpeed, pos, pathLength, path] = pq.pop()!;

        if (currentCost > distances[pos.x][pos.y]) return;

        for (const [dirVec, direction] of directions) {
            Pathfinding.updatePosition(pos, dirVec, direction, mapArray, distances, pathMap, pq, currentCost, remainingSpeed, pathLength, path);
        }
    }

    private static getDirections(): [Vec2, Direction][] {
        return [
            [{ x: 0, y: -1 }, Direction.UP],
            [{ x: 0, y: 1 }, Direction.DOWN],
            [{ x: -1, y: 0 }, Direction.LEFT],
            [{ x: 1, y: 0 }, Direction.RIGHT],
        ];
    }

    private static updatePosition(
        pos: Vec2,
        dirVec: Vec2,
        direction: Direction,
        mapArray: Tile[][],
        distances: number[][],
        pathMap: Direction[][][],
        pq: [number, number, Vec2, number, Direction[]][],
        currentCost: number,
        remainingSpeed: number,
        pathLength: number,
        path: Direction[],
    ) {
        const newPos: Vec2 = { x: pos.x + dirVec.x, y: pos.y + dirVec.y };
        const rows = mapArray.length;
        const cols = mapArray[0].length;

        if (newPos.x >= 0 && newPos.x < rows && newPos.y >= 0 && newPos.y < cols) {
            const tileType = mapArray[newPos.x][newPos.y].terrain;
            const movementCost = TILE_COSTS[tileType];

            const newCost = currentCost + movementCost;
            const newSpeed = remainingSpeed - movementCost;
            const newPathLength = pathLength + 1;

            if (
                (newSpeed >= 0 && newCost < distances[newPos.x][newPos.y]) ||
                (newCost === distances[newPos.x][newPos.y] && newPathLength < pathMap[newPos.x][newPos.y].length)
            ) {
                distances[newPos.x][newPos.y] = newCost;
                pathMap[newPos.x][newPos.y] = [...path, direction];
                pq.push([newCost, newSpeed, newPos, newPathLength, [...path, direction]]);
            }
        }
    }
    private static buildReachableTiles(distances: number[][], pathMap: Direction[][][], initialSpeed: number): ReachableTile[] {
        const reachableTiles: ReachableTile[] = [];
        const rows = distances.length;
        const cols = distances[0].length;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (distances[i][j] < Infinity) {
                    reachableTiles.push({
                        x: i,
                        y: j,
                        remainingSpeed: initialSpeed - distances[i][j],
                        path: pathMap[i][j],
                    });
                }
            }
        }

        return reachableTiles;
    }
}
