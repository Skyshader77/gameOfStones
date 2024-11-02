import {
    MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING,
    MOCK_ROOM_MULTIPLE_PLAYERS_WINNER,
    MOCK_ROOM_ONE_PLAYER_LEFT,
} from '@app/constants/gameplay.test.constants';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameEndService } from './game-end.service';
import { GameMode } from '@common/enums/game-mode.enum';

describe('GameEndService', () => {
    let gameEndService: GameEndService;
    let roomManagerService: RoomManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameEndService,
                {
                    provide: RoomManagerService,
                    useValue: {
                        getRoom: jest.fn(),
                    },
                },
            ],
        }).compile();

        gameEndService = module.get<GameEndService>(GameEndService);
        roomManagerService = module.get<RoomManagerService>(RoomManagerService);
    });

    describe('hasGameEnded', () => {
        it('should return the correct GameEndOutput when one player has three victories', () => {
            const room = MOCK_ROOM_MULTIPLE_PLAYERS_WINNER;
            jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);

            const result = gameEndService.hasGameEnded(room);
            expect(result).toEqual({
                hasGameEnded: true,
                winningPlayerName: 'Player2',
            });
        });

        it('should return the correct GameEndOutput when the game is not ended', () => {
            const room = MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING;
            jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);

            const result = gameEndService.hasGameEnded(room);
            expect(result).toEqual({
                hasGameEnded: false,
                winningPlayerName: null,
            });
        });
    });

    describe('CTF Mode', () => {
        it('should return the correct GameEndOutput for CTF mode', () => {
            const room = {
                ...MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING,
                game: { ...MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING.game, mode: GameMode.CTF },
            };
            jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);

            const result = gameEndService.hasGameEnded(room);

            expect(result).toEqual({
                hasGameEnded: false,
                winningPlayerName: null,
            });
        });
    });

    describe('haveAllButOnePlayerAbandoned', () => {
        it('should return true when only one player remains in game', () => {
            const players = MOCK_ROOM_ONE_PLAYER_LEFT.players;

            const result = gameEndService.haveAllButOnePlayerAbandoned(players);
            expect(result).toBeFalsy();
        });

        it('should return false when multiple players are still in game', () => {
            const players = MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING.players;

            const result = gameEndService.haveAllButOnePlayerAbandoned(players);
            expect(result).toBeTruthy();
        });
    });
});
