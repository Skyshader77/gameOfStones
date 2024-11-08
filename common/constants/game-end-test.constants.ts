import { GameEndStats } from '@common/interfaces/end-statistics';
import { GameEndInfo } from '../interfaces/game-gateway-outputs';

export const MOCK_GAME_END_STATS: GameEndStats = {
    // TODO create a default value to use in the client service and in tests
}

export const MOCK_GAME_END_NOTHING_OUTPUT: GameEndInfo = {
    winnerName: '',
};

export const MOCK_GAME_END_WINNING_OUTPUT: GameEndInfo = {
    winnerName: 'Othmane',
};
