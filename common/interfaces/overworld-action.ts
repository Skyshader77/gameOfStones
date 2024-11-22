import { OverWorldActionType } from '../enums/overworld-action-type.enum';
import { Vec2 } from './vec2';

export interface OverWorldAction {
    action: OverWorldActionType;
    position: Vec2;
}