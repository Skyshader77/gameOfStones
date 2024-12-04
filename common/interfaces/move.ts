import { Vec2 } from './vec2';

export interface MoveData {
    destination: Vec2;
    playerName: string;
}

export interface ReachableTile {
    position: Vec2;
    remainingMovement: number;
    path: PathNode[];
    cost: number;
}

export interface PathNode {
    direction: Direction;
    remainingMovement: number;
}

export enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
}

export const directionToVec2Map: { [key in Direction]: Vec2 } = {
    [Direction.UP]: { x: 0, y: -1 },
    [Direction.DOWN]: { x: 0, y: 1 },
    [Direction.LEFT]: { x: -1, y: 0 },
    [Direction.RIGHT]: { x: 1, y: 0 },
};

export const vec2ToDirectionMap = new Map<Vec2, Direction>([
    [{ x: 0, y: -1 }, Direction.UP],
    [{ x: 0, y: 1 }, Direction.DOWN],
    [{ x: -1, y: 0 }, Direction.LEFT],
    [{ x: 1, y: 0 }, Direction.RIGHT]
]);

export interface MovementServiceOutput {
    optimalPath: ReachableTile;
    hasTripped: boolean;
    isOnItem: boolean;
    interactiveObject: Vec2 | null;
}

export type CheckFunction<T> = (pos: Vec2) => T | null
