import { ItemType } from '@common/enums/item-type.enum';
import { Avatar } from '../enums/avatar.enum';
import { PlayerRole } from '../enums/player-role.enum';
import { Dice } from './dice';
import { Vec2 } from './vec2';

export interface Player {
    playerInfo: PlayerInfo;
    playerInGame: PlayerInGame;
}

export interface PlayerInfo {
    id: string;
    userName: string;
    avatar: Avatar;
    role: PlayerRole;
}

export interface PlayerInGame {
    dice: Dice;
    baseAttributes: PlayerAttributes;
    attributes: PlayerAttributes;
    inventory: ItemType[];
    currentPosition: Vec2;
    startPosition: Vec2;
    winCount: number;
    remainingMovement: number;
    remainingActions: number;
    remainingHp: number;
    hasAbandoned: boolean;
}

export interface PlayerAttributes {
    hp: number;
    speed: number;
    attack: number;
    defense: number;
}
