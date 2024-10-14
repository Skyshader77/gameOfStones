import { Vec2 } from '@common/interfaces/vec2';
import { Item } from './item';

export class Player {
    id: string;
    userName: string;
    isHuman: boolean;
    statistics: PlayerStatistics;
    playerInGame: PlayerInGame;
    isInRoom: boolean;
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
    attack: number;
    defense: number;
    inventory: Item[];
    currentPosition: Vec2;
    hasAbandonned: boolean;
}
