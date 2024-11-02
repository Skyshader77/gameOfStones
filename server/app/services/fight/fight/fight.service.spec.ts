import { Test, TestingModule } from '@nestjs/testing';
import { FightService } from './fight.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { EVASION_COUNT, EVASION_PROBABILITY } from './fight.service.constants';
import { Fight } from '@common/interfaces/fight';
import { DIE_ROLL_1_RESULT, DIE_ROLL_5_RESULT, DIE_ROLL_6_RESULT, MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO, MOCK_ROOM_COMBAT } from '@app/constants/combat.test.constants';

describe('FightService', () => {
  let service: FightService;
  let roomManagerService: RoomManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FightService,
        {
          provide: RoomManagerService,
          useValue: {
            getCurrentRoomPlayer: jest.fn().mockReturnValue(MOCK_FIGHTER_ONE)
          }
        }
      ],
    }).compile();

    service = module.get<FightService>(FightService);
    roomManagerService = module.get<RoomManagerService>(RoomManagerService);
  });

  describe('isFightValid', () => {
    it('should return true when fighters are available and close', () => {
      const result = service.isFightValid(MOCK_ROOM_COMBAT, 'Player2');
      expect(result).toBe(true);
    });

    it('should return false when opponent has abandoned', () => {
      const modifiedRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT));
      modifiedRoomGame.players[1].playerInGame.hasAbandonned = true;

      const result = service.isFightValid(modifiedRoomGame, 'Player2');
      expect(result).toBe(false);
    });

    it('should return false when fighters are too far apart', () => {
      const modifiedRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT));
      modifiedRoomGame.players[1].playerInGame.currentPosition = { x: 3, y: 3 };

      const result = service.isFightValid(modifiedRoomGame, 'Player2');
      expect(result).toBe(false);
    });

    it('should return false when opponent does not exist', () => {
      const result = service.isFightValid(MOCK_ROOM_COMBAT, 'NonExistentPlayer');
      expect(result).toBe(false);
    });
  });

  describe('startFight', () => {
    it('should initialize fight with correct values', () => {
      const modifiedRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT));
      const result = service.startFight(modifiedRoomGame, 'Player2');

      expect(modifiedRoomGame.game.fight).toBeDefined();
      expect(modifiedRoomGame.game.fight.fighters).toHaveLength(2);
      expect(modifiedRoomGame.game.fight.winner).toBeNull();
      expect(modifiedRoomGame.game.fight.numbEvasionsLeft).toEqual([EVASION_COUNT, EVASION_COUNT]);
      expect(modifiedRoomGame.game.fight.currentFighter).toBe(1);
      expect(modifiedRoomGame.game.fight.hasPendingAction).toBe(false);

      expect(result).toEqual(['Player2', 'Player1']);
    });
  });

  describe('attack', () => {
    let fight: Fight;

    beforeEach(() => {
      fight = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT.game.fight));
    });

    it('should calculate attack result correctly when damage is dealt', () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(DIE_ROLL_5_RESULT)
        .mockReturnValueOnce(DIE_ROLL_1_RESULT);

      const result = service.attack(fight);
      expect(result.hasDealtDamage).toBe(true);
      expect(result.wasWinningBlow).toBe(false);
      expect(fight.fighters[1].playerInGame.remainingHp).toBe(MOCK_FIGHTER_TWO.playerInGame.remainingHp - 1);
    });

    it('should handle winning blow', () => {
      fight.fighters[1].playerInGame.remainingHp = 1;
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(DIE_ROLL_5_RESULT)
        .mockReturnValueOnce(DIE_ROLL_1_RESULT);

      const result = service.attack(fight);

      expect(result.hasDealtDamage).toBe(true);
      expect(result.wasWinningBlow).toBe(true);
      expect(fight.winner).toBe(fight.fighters[0]);
      expect(fight.fighters[1].playerInGame.remainingHp).toBe(0);
    });

    it('should handle missed attacks', () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(DIE_ROLL_1_RESULT)
        .mockReturnValueOnce(DIE_ROLL_6_RESULT);

      const result = service.attack(fight);

      expect(result.hasDealtDamage).toBe(false);
      expect(result.wasWinningBlow).toBe(false);
      expect(fight.fighters[1].playerInGame.remainingHp).toBe(MOCK_FIGHTER_TWO.playerInGame.remainingHp);
    });
  });

  describe('evade', () => {
    let fight: Fight;

    beforeEach(() => {
      fight = {
        fighters: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
        winner: null,
        numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
        currentFighter: 0,
        hasPendingAction: false
      };
    });

    it('should return false when no evasions left', () => {
      fight.numbEvasionsLeft[0] = 0;
      const result = service.evade(fight);
      expect(result).toBe(false);
    });

    it('should handle successful evasion', () => {
      jest.spyOn(Math, 'random').mockReturnValue(EVASION_PROBABILITY - 0.1);
      const result = service.evade(fight);
      expect(result).toBe(true);
      expect(fight.numbEvasionsLeft[0]).toBe(EVASION_COUNT);
    });

    it('should handle failed evasion', () => {
      jest.spyOn(Math, 'random').mockReturnValue(EVASION_PROBABILITY + 0.1);
      const result = service.evade(fight);
      expect(result).toBe(false);
      expect(fight.numbEvasionsLeft[0]).toBe(EVASION_COUNT - 1);
    });
  });

  describe('nextFightTurn', () => {
    it('should correctly cycle between fighters', () => {
      const fight: Fight = {
        fighters: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
        winner: null,
        numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
        currentFighter: 0,
        hasPendingAction: false
      };

      const nextFighter = service.nextFightTurn(fight);
      expect(fight.currentFighter).toBe(1);
      expect(nextFighter).toBe('Player2');

      const backToFirst = service.nextFightTurn(fight);
      expect(fight.currentFighter).toBe(0);
      expect(backToFirst).toBe('Player1');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
