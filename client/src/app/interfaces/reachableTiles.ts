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
