import { Socket } from 'socket.io';
import { Item } from './item';

export class Player {
    id: string;
    userName: string;
    avatar: string;
    roomCode: string;
    statistics: PlayerStatistics;
    baseStats: PlayerStats;
    currentPosition: Vec2;
    inventory: Item[];
    socket: Socket;
}

export interface Vec2 {
    x: number;
    y: number;
}

export interface PlayerStatistics {
    numbVictories: number;
    numbDefeats: number;
    numbEscapes: number;
}

export interface PlayerStats {
    movementSpeed: number;
    attack: number;
    defense: number;
}
