import { Player as PlayerInterface } from '@common/interfaces/player';

export interface Player extends PlayerInterface {
    statistics: PlayerStatistics;
}

// export interface PlayerInfo {
//     id: string;
//     userName: string;
//     role: PlayerRole;
// }

export interface PlayerStatistics {
    isWinner: boolean;
    numbDefeats: number;
    numbEscapes: number;
    numbBattles: number;
    totalHpLost: number;
    totalDamageGiven: number;
    numbPickedUpItems: number;
    percentageMapVisited: number;
}

// export interface PlayerInGame {
//     hp: number;
//     movementSpeed: number;
//     remainingMovement: number;
//     dice: DiceType;
//     attack: number;
//     defense: number;
//     inventory: Item[];
//     currentPosition: Vec2;
//     startPosition: Vec2;
//     hasAbandonned: boolean;
//     isCurrentPlayer: boolean;
// }
