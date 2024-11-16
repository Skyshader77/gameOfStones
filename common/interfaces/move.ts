import { Vec2 } from './vec2';

export interface MoveData {
    destination: Vec2;
    playerId: string;
}

export interface ReachableTile {
    position: Vec2;
    remainingMovement: number;
    path: Direction[];
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

export interface MovementServiceOutput {
    optimalPath: ReachableTile;
    hasTripped: boolean;
    isOnItem: boolean;
    isNextToInteractableObject: boolean,
}