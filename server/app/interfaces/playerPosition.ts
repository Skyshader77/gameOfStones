export interface PlayerPosition {
    currentPosition: MovementNode;
    isCurrentPlayer: boolean;
    id: number;
}

export interface MovementNode {
    x: number;
    y: number;
}
