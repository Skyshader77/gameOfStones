import { Vec2 } from '@common/interfaces/vec2';

export enum MapMouseEventButton {
    Left = 0,
    Right = 2,
    Middle = 1,
}

export interface MapMouseEvent {
    tilePosition: Vec2;
    button: MapMouseEventButton;
}
