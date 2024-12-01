import { ItemType } from '../enums/item-type.enum';
import { DeadPlayerPayload } from './player';
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

export interface ItemLostPayload {
    playerName: string;
    newInventory: ItemType[];
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

export interface HammerPayload {
    playerUsedName: string;
    deadPlayers: DeadPlayerPayload[];
    affectedTiles: Vec2[];
}
