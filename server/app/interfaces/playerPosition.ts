export interface Player {
    currentPosition: Vec2;
    isCurrentPlayer: boolean;
    id: number;
    maxDisplacementValue: number;
}

export interface Vec2 {
    x: number;
    y: number;
}
