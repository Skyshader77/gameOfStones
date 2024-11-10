import {
    MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING,
    MOCK_ROOM_MULTIPLE_PLAYERS_WINNER,
    MOCK_ROOM_ONE_PLAYER_LEFT,
} from '@app/constants/gameplay.test.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { GameEndService } from './game-end.service';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { MOCK_GAME_END_STATS } from '@common/constants/game-end-test.constants';

describe('GameEndService', () => {
    let gameEndService: GameEndService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameEndService,
                {
                    provide: GameStatsService,
                    useValue: {
                        getGameEndStats: jest.fn().mockReturnValue(MOCK_GAME_END_STATS),
                    },
                },
            ],
        }).compile();

        gameEndService = module.get<GameEndService>(GameEndService);
    });

    describe('hasGameEnded', () => {
        it('should return the correct GameEndOutput when one player has three victories', () => {
            const room = MOCK_ROOM_MULTIPLE_PLAYERS_WINNER;
            const result = gameEndService.hasGameEnded(room);
            expect(result).toEqual({
                hasEnded: true,
                winnerName: 'Player2',
                endStats: MOCK_GAME_END_STATS,
            });
        });

        it('should return the correct GameEndOutput when the game is not ended', () => {
            const room = MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING;

            const result = gameEndService.hasGameEnded(room);
            expect(result).toEqual({
                hasEnded: false,
                winnerName: null,
                endStats: null,
            });
        });
    });

    describe('CTF Mode', () => {
        it('should return the correct GameEndOutput for CTF mode', () => {
            const room = {
                ...MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING,
                game: { ...MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING.game, mode: GameMode.CTF },
            };

            const result = gameEndService.hasGameEnded(room);

            expect(result).toEqual({
                hasEnded: false,
                winnerName: null,
                endStats: null,
            });
        });
    });

    describe('haveAllButOnePlayerAbandoned', () => {
        it('should return true when only one player remains in game', () => {
            const players = MOCK_ROOM_ONE_PLAYER_LEFT.players;

            const result = gameEndService.haveAllButOnePlayerAbandoned(players);
            expect(result).toBeTruthy();
        });

        it('should return false when multiple players are still in game', () => {
            const players = MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING.players;

            const result = gameEndService.haveAllButOnePlayerAbandoned(players);
            expect(result).toBeFalsy();
        });
    });
});
