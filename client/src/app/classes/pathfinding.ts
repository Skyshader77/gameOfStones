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

type PositionParams = {
    pos: Vec2;
    dirVec: Vec2;
    direction: Direction;
    mapArray: Tile[][];
    distances: number[][];
    pathMap: Direction[][][];
    pq: [number, number, Vec2, number, Direction[]][];
    currentCost: number;
    remainingSpeed: number;
    pathLength: number;
    path: Direction[];
};

export class Pathfinding {
    static dijkstraReachableTiles(mapArray: Tile[][], start: Vec2, initialSpeed: number): ReachableTile[] {
        const rows = mapArray.length;
        const cols = mapArray[0].length;

        const pq = Pathfinding.initializePriorityQueue(start, initialSpeed);
        const distances = Pathfinding.initializeDistances(rows, cols, start);
        const pathMap = Pathfinding.initializePathMap(rows, cols);

        while (pq.length > 0) {
            Pathfinding.processQueue(pq, mapArray, distances, pathMap);
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
    ) {
        const directions: [Vec2, Direction][] = Pathfinding.getDirections();

        pq.sort((a, b) => (a[0] === b[0] ? a[3] - b[3] : a[0] - b[0]));

        const next = pq.pop();
        if (!next) return;
        const [currentCost, remainingSpeed, pos, pathLength, path] = next;

        if (currentCost > distances[pos.x][pos.y]) return;

        for (const [dirVec, direction] of directions) {
            const positionParams: PositionParams = {
                pos,
                dirVec,
                direction,
                mapArray,
                distances,
                pathMap,
                pq,
                currentCost,
                remainingSpeed,
                pathLength,
                path,
            };
            Pathfinding.updatePosition(positionParams);
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

    private static updatePosition(positionParams: PositionParams) {
        const newPos: Vec2 = { x: positionParams.pos.x + positionParams.dirVec.x, y: positionParams.pos.y + positionParams.dirVec.y };
        const rows = positionParams.mapArray.length;
        const cols = positionParams.mapArray[0].length;

        if (newPos.x >= 0 && newPos.x < rows && newPos.y >= 0 && newPos.y < cols) {
            const tileType = positionParams.mapArray[newPos.x][newPos.y].terrain;
            const movementCost = TILE_COSTS[tileType];

            const newCost = positionParams.currentCost + movementCost;
            const newSpeed = positionParams.remainingSpeed - movementCost;
            const newPathLength = positionParams.pathLength + 1;

            if (
                (newSpeed >= 0 && newCost < positionParams.distances[newPos.x][newPos.y]) ||
                (newCost === positionParams.distances[newPos.x][newPos.y] && newPathLength < positionParams.pathMap[newPos.x][newPos.y].length)
            ) {
                positionParams.distances[newPos.x][newPos.y] = newCost;
                positionParams.pathMap[newPos.x][newPos.y] = [...positionParams.path, positionParams.direction];
                positionParams.pq.push([newCost, newSpeed, newPos, newPathLength, [...positionParams.path, positionParams.direction]]);
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
