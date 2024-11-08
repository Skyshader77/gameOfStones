import { ItemType } from '../enums/item-type.enum';
import { Vec2 } from './vec2';

export interface Item {
    position: Vec2;
    type: ItemType;
}

export interface ItemDrop{
    newInventory: ItemType[],
    item: Item
}