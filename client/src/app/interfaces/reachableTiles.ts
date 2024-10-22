import { Vec2 } from './vec2';

export interface ReachableTile {
    x: number;
    y: number;
    remainingSpeed: number;
    path: Direction[];
}

export enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
}

export interface MoveData {
    destination: Vec2;
    playerId: string;
}
