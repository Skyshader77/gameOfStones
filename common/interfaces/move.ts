import { Vec2 } from './vec2';
import { Player } from './player';

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

export interface MovementServiceOutput {
    optimalPath: ReachableTile;
    hasTripped: boolean;
    isOnItem: boolean;
    interactiveObject: Vec2 | null;
}

export interface MovementFlags {
    isOnClosedDoor: boolean;
    isOnItem: boolean;
    hasTripped: boolean;
    interactiveObject: Vec2 | null;
}

export interface PlayerMoveNode {
    position: Vec2;
    remainingMovement: number;
    path: PathNode[];
}

export interface PathfindingInputs {
    movementOverride?: number;
    currentPlayer?: Player;
    players?: Player[];
    startPosition?: Vec2;
}
export interface PathfindingResult {
    reachableTiles: ReachableTile[];
    nearestObject?: { position: Vec2; cost: number };
}
