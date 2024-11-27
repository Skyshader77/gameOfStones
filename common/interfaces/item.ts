import { ItemType } from '../enums/item-type.enum';
import { Vec2 } from './vec2';

export interface Item {
    position: Vec2;
    type: ItemType;
}

export interface ItemDropPayload {
    playerName: string;
    newInventory: ItemType[];
    item: Item;
}

export interface ItemPickupPayload {
    newInventory: ItemType[];
    itemType: ItemType;
}

export interface PlayerSlipPayload {
    items: Item[];
}

export interface ItemUsedPayload {
    usagePosition: Vec2;
    type: ItemType;
}