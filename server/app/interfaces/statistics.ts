import { Vec2 } from '@common/interfaces/vec2';

export interface GameStats {
    startTime: Date;
    turnCount: number;
    percentageDoorsUsed: number;
    numberOfPlayersWithFlag: number;
    highestPercentageOfMapVisited: number;
    visitedTiles: boolean[][];
    interactedDoors: Vec2[];
    doorCount: number;
    playerStats: Map<string, PlayerStatistics>;
}

export interface PlayerStatistics {
    isWinner: boolean;
    fightCount: number;
    winCount: number;
    lossCount: number;
    evasionCount: number;
    totalHpLost: number;
    totalDamageGiven: number;
    numbPickedUpItems: number;
    visitedTiles: boolean[][];
}
