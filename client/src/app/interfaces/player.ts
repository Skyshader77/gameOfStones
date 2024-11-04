import { AvatarChoice, SpriteSheetChoice } from '@app/constants/player.constants';
import { DiceType, PlayerRole } from '@common/constants/player.constants';
import { Item } from '@common/interfaces/item';
import { Vec2 } from '@common/interfaces/vec2';

export class Player {
    playerInfo: PlayerInfo;
    playerInGame: PlayerInGame;
}

export class PlayerInfo {
    id: string;
    userName: string;
    avatar: AvatarChoice;
    role: PlayerRole;
}

export interface PlayerInGame {
    hp: number;
    isCurrentPlayer: boolean;
    isFighting: boolean;
    movementSpeed: number;
    remainingMovement: number;
    dice: DiceType;
    attack: number;
    defense: number;
    inventory: Item[];
    renderInfo: PlayerRenderInfo;
    currentPosition: Vec2;
    startPosition: Vec2;
    hasAbandonned: boolean;
    //combatWins: number;
}

export interface PlayerRenderInfo {
    spriteSheet: SpriteSheetChoice;
    currentSprite: number;
    offset: Vec2;
}
