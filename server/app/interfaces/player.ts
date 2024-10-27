import { DiceType, PlayerRole } from '@common/constants/player.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { Item } from './item';

export interface Player {
    playerInfo: PlayerInfo;
    statistics: PlayerStatistics;
    playerInGame: PlayerInGame;
}

export interface PlayerInfo {
    id: string;
    userName: string;
    // avatar: AvatarChoice; TODO MAKE A BETTER INTERFACE FOR THE AVATAR
    role: PlayerRole;
}

export interface PlayerStatistics {
    isWinner: boolean;
    numbVictories: number;
    numbDefeats: number;
    numbEscapes: number;
    numbBattles: number;
    totalHpLost: number;
    totalDamageGiven: number;
    numbPickedUpItems: number;
    percentageMapVisited: number;
}

export interface PlayerInGame {
    hp: number;
    movementSpeed: number;
    remainingSpeed: number;
    dice: DiceType;
    attack: number;
    defense: number;
    inventory: Item[];
    currentPosition: Vec2;
    startPosition: Vec2;
    hasAbandonned: boolean;
}
