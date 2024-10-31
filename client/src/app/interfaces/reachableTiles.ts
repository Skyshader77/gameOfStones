import { Vec2 } from './vec2';

export interface ReachableTile {
    pos: Vec2;
    remainingSpeed: number;
    path: Direction[];
}

export enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
}
