import { Vec2 } from './vec2';
export interface MoveData {
    destination: Vec2;
    playerId: string;
}

export interface MovementServiceOutput {
    dijkstraServiceOutput: DijkstraServiceOutput;
    hasTripped: boolean;
}

export interface DijkstraServiceOutput {
    position: Vec2;
    displacementVector: Vec2[];
    remainingSpeed: number;
}