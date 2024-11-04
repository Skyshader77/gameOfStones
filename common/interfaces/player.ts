import { Dice } from './dice';
import { Item } from './item';
import { Vec2 } from './vec2';
import { PlayerRole } from '../enums/player-role.enum';
import { Avatar } from '../enums/avatar.enum';

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
    attributes: PlayerAttributes;
    inventory: Item[];
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
