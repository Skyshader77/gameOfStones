import { Player } from '@app/interfaces/player';
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
      const room = {
        players: [
          { playerInfo: { userName: 'Player 1' }, statistics: { numbVictories: 3 } },
          { playerInfo: { userName: 'Player 2' }, statistics: { numbVictories: 1 } },
        ],
      };
      jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);

      const result = gameEndService.hasGameEnded('testRoomCode');
      expect(result).toEqual({
        hasGameEnded: true,
        winningPlayerName: 'Player 1',
      });
    });

    it('should return the correct GameEndOutput when all but one player has abandoned', () => {
      const room = {
        players: [
          { playerInfo: { userName: 'Player 1' }, playerInGame: { hasAbandonned: true } },
          { playerInfo: { userName: 'Player 2' }, playerInGame: { hasAbandonned: false } },
        ],
      };
      jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);

      const result = gameEndService.hasGameEnded('testRoomCode');
      expect(result).toEqual({
        hasGameEnded: true,
        winningPlayerName: 'Player 2',
      });
    });

    it('should return the correct GameEndOutput when the game is not ended', () => {
      const room = {
        players: [
          { playerInfo: { userName: 'Player 1' }, statistics: { numbVictories: 1 } },
          { playerInfo: { userName: 'Player 2' }, statistics: { numbVictories: 1 } },
        ],
      };
      jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(room);

      const result = gameEndService.hasGameEnded('testRoomCode');
      expect(result).toEqual({
        hasGameEnded: false,
        winningPlayerName: null,
      });
    });
  });

  describe('doesOnePlayerHaveThreeVictories', () => {
    it('should return the correct GameEndOutput when one player has three victories', () => {
      const players: Player[] = [
        { playerInfo: { userName: 'Player 1' }, statistics: { numbVictories: 3 } },
        { playerInfo: { userName: 'Player 2' }, statistics: { numbVictories: 1 } },
      ];

      const result = gameEndService.doesOnePlayerHaveThreeVictories(players);
      expect(result).toEqual({
        hasGameEnded: true,
        winningPlayerName: 'Player 1',
      });
    });

    it('should return the correct GameEndOutput when no player has three victories', () => {
      const players: Player[] = [
        { playerInfo: { userName: 'Player 1' }, statistics: { numbVictories: 2 } },
        { playerInfo: { userName: 'Player 2' }, statistics: { numbVictories: 1 } },
      ];

      const result = gameEndService.doesOnePlayerHaveThreeVictories(players);
      expect(result).toEqual({
        hasGameEnded: false,
        winningPlayerName: null,
      });
    });
  });

  describe('haveAllButOnePlayerAbandonned', () => {
    it('should return the correct GameEndOutput when all but one player has abandoned', () => {
      const players: Player[] = [
        { playerInfo: { userName: 'Player 1' }, playerInGame: { hasAbandonned: true } },
        { playerInfo: { userName: 'Player 2' }, playerInGame: { hasAbandonned: false } },
      ];

      const result = gameEndService.haveAllButOnePlayerAbandonned(players);
      expect(result).toEqual({
        hasGameEnded: true,
        winningPlayerName: 'Player 2',
      });
    });

    it('should return the correct GameEndOutput when no player has abandoned', () => {
      const players: Player[] = [
        { playerInfo: { userName: 'Player 1' }, playerInGame: { hasAbandonned: false } },
        { playerInfo: { userName: 'Player 2' }, playerInGame: { hasAbandonned: false } },
      ];

      const result = gameEndService.haveAllButOnePlayerAbandonned(players);
      expect(result).toEqual({
        hasGameEnded: false,
        winningPlayerName: null,
      });
    });
  });
});