import {GameEndOutput} from '../interfaces/game-gateway-outputs';

export const MOCK_GAME_END_NOTHING_OUTPUT: GameEndOutput = {
    hasGameEnded: false,
    winningPlayerName: '',
};

export const MOCK_GAME_END_WINNING_OUTPUT: GameEndOutput = {
    hasGameEnded: true,
    winningPlayerName: 'Othmane',
};