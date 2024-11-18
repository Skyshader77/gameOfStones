import { ItemType } from '@common/enums/item-type.enum';
import { Vec2 } from '@common/interfaces/vec2';

export enum GameAction {
    Move,
    ToggleDoor,
    PickupItem,
    DropItem,
    UseItem,
    Fight,
    Attack,
    Evade,
    EndTurn,
}

export interface AiAction {
    action: GameAction;
    position: Vec2;
    waitTime: number;
    item?: ItemType;
}
