import { Vec2 } from '@common/interfaces/vec2';
import { Socket } from 'socket.io';
import { Item } from './item';

export class Player {
    id: string;
    userName: string;
    isHuman: boolean;
    roomCode: string;
    statistics: PlayerStatistics;
    playerInGame: PlayerInGame;
    sockets: Socket[];
}

export interface PlayerStatistics {
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
