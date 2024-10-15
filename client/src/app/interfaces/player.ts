import { AvatarChoice, SpriteSheetChoice } from '@app/constants/player.constants';
import { DiceType, PlayerRole } from '@common/interfaces/player.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { Item } from './map';

export class Player {
    id: string;
    userName: string;
    avatar: AvatarChoice;
    role: PlayerRole;
    playerInGame: PlayerInGame;
}

export interface PlayerInGame {
    hp: number;
    isCurrentPlayer: boolean;
    isFighting: boolean;
    movementSpeed: number;
    dice: DiceType;
    attack: number;
    defense: number;
    inventory: Item[];
    renderInfo: PlayerRenderInfo;
    currentPosition: Vec2;
    hasAbandonned: boolean;
}

export interface PlayerRenderInfo {
    spriteSheet: SpriteSheetChoice;
    offset: Vec2;
}
