import { Vec2 } from '@common/interfaces/vec2';

export interface MapMouseEvent {
    tilePosition: Vec2;
    clickType: 'left' | 'right' | 'middle';
}
