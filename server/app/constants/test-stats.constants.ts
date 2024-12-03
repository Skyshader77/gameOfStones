import { GameStats, PlayerStats } from '@app/interfaces/statistics';
import { ItemType } from '@common/enums/item-type.enum';

export const MOCK_PLAYER_STATS: PlayerStats = {
    fightCount: 0,
    winCount: 0,
    lossCount: 0,
    evasionCount: 0,
    totalHpLost: 0,
    totalDamageDealt: 0,
    pickedItems: [ItemType.Flag],
    visitedTiles: [[false]],
};

export const MOCK_GAME_STATS: GameStats = {
    startTime: new Date('2024-11-01T00:30:00'), // 30 minutes
    turnCount: 0,
    visitedTiles: [[false]],
    interactedDoors: [],
    playersWithFlag: [],
    doorCount: 1,
    walkableTilesCount: 1,
    playerStats: new Map<string, PlayerStats>(),
};
