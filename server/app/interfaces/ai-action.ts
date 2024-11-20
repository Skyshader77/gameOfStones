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

export enum AiState {
    StartTurn,
    Moving,
    Action,
    Fighting,
    CalculatingNextAction,
}

export interface AiAction {
    action: GameAction;
    position: Vec2;
    waitTime: number;
    item?: ItemType;
}

export interface ClosestObject {
    position: Vec2;
    cost: number;
}
