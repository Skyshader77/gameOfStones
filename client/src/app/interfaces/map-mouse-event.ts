import { Vec2 } from '@common/interfaces/vec2';

export enum MapMouseEventButton {
    Left = 'left',
    Right = 'right',
    Middle = 'middle',
}

export interface MapMouseEvent {
    tilePosition: Vec2;
    button: MapMouseEventButton;
}
