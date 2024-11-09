import { GameEndStats } from '../interfaces/end-statistics';
import { GameEndInfo } from '../interfaces/game-gateway-outputs';

export const MOCK_GAME_END_STATS: GameEndStats = {
    timeTaken: 0,
    turnCount: 0,
    percentageDoorsUsed: null,
    percentageTilesTraversed: 0,
    numberOfPlayersWithFlag: 0,
    playerStats: [
        {
            name: 'Othmane',
            fightCount: 0,
            winCount: 0,
            lossCount: 0,
            evasionCount: 0,
            totalHpLost: 0,
            totalDamageDealt: 0,
            itemCount: 0,
            percentageTilesTraversed: 0,
        },
    ],
};

export const MOCK_GAME_END_WINNING_OUTPUT: GameEndInfo = {
    winnerName: 'Othmane',
    endStats: MOCK_GAME_END_STATS,
};
