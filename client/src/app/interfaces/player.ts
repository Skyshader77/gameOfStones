import { AvatarChoice, SpriteSheetChoice } from '@app/constants/player.constants';
import { DiceType, PlayerRole } from '@common/interfaces/player.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { Item } from './map';

export class Player {
    id: string;
    userName: string;
    avatar: AvatarChoice;
    role: PlayerRole;
    spriteSheet: SpriteSheetChoice;
    playerInGame: PlayerInGame;
}

export interface PlayerInGame {
    hp: number;
    movementSpeed: number;
    dice: DiceType;
    attack: number;
    defense: number;
    inventory: Item[];
    currentPosition: Vec2;
    hasAbandonned: boolean;
}
