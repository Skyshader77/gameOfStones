import { MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING, MOCK_ROOM_MULTIPLE_PLAYERS_WINNER, MOCK_ROOM_MULTIPLE_PLAYERS_WINNER_BY_DEFAULT } from '@app/constants/gameplay.test.constants';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameEndService } from './game-end.service';

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
      const room =MOCK_ROOM_MULTIPLE_PLAYERS_WINNER;
      jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);

      const result = gameEndService.hasGameEnded('testRoomCode');
      expect(result).toEqual({
        hasGameEnded: true,
        winningPlayerName: 'Player2',
      });
    });

    it('should return the correct GameEndOutput when all but one player has abandoned', () => {
      const room = MOCK_ROOM_MULTIPLE_PLAYERS_WINNER_BY_DEFAULT;
      jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);

      const result = gameEndService.hasGameEnded('testRoomCode');
      expect(result).toEqual({
        hasGameEnded: true,
        winningPlayerName: 'Player3',
      });
    });

    it('should return the correct GameEndOutput when the game is not ended', () => {
      const room =MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING;
      jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);

      const result = gameEndService.hasGameEnded('testRoomCode');
      expect(result).toEqual({
        hasGameEnded: false,
        winningPlayerName: null,
      });
    });
  });
});