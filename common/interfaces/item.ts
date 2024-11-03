import { Vec2 } from './vec2';
import { ItemType } from '../enums/item-type.enum';

export interface Item {
    position: Vec2;
    type: ItemType;
}
