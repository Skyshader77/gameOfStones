import { Player as CommonPlayer } from '@common/interfaces/player';

export interface Player extends CommonPlayer {
    statistics: PlayerStatistics;
}

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
