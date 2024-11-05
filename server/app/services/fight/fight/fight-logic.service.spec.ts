import {
    DIE_ROLL_1_RESULT,
    DIE_ROLL_5_RESULT,
    DIE_ROLL_6_RESULT,
    MOCK_FIGHTER_ONE,
    MOCK_FIGHTER_TWO,
    MOCK_ROOM_COMBAT,
    MOCK_TIMER,
} from '@app/constants/combat.test.constants';
import { TERRAIN_PATTERNS } from '@app/constants/player.movement.test.constants';
import { DELTA_RANDOM } from '@app/constants/test.constants';
import { Fight } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { FightLogicService } from './fight-logic.service';
import { EVASION_COUNT, EVASION_PROBABILITY } from './fight.service.constants';

describe('FightService', () => {
    let service: FightLogicService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FightLogicService,
                {
                    provide: RoomManagerService,
                    useValue: {
                        getCurrentRoomPlayer: jest.fn().mockReturnValue(MOCK_FIGHTER_ONE),
                    },
                },
                {
                    provide: GameTimeService,
                    useValue: { getInitialTimer: jest.fn().mockReturnValue(MOCK_TIMER) },
                },
            ],
        }).compile();

        service = module.get<FightLogicService>(FightLogicService);
    });

    describe('isFightValid', () => {
        it('should return true when fighters are available and close', () => {
            const result = service.isFightValid(MOCK_ROOM_COMBAT, 'Player2');
            expect(result).toBe(true);
        });

        it('should return false when opponent has abandoned', () => {
            const modifiedRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            modifiedRoomGame.players[1].playerInGame.hasAbandoned = true;

            const result = service.isFightValid(modifiedRoomGame, 'Player2');
            expect(result).toBe(false);
        });

        it('should return false when fighters are too far apart', () => {
            const modifiedRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
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
            const EXPECTED_NO_DEBUFF_VALUE = 4;
            const modifiedRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            modifiedRoomGame.game.map.mapArray = TERRAIN_PATTERNS.zigZag;
            service.initializeFight(modifiedRoomGame, 'Player2');
            expect(modifiedRoomGame.game.fight).toBeDefined();
            expect(modifiedRoomGame.game.fight.fighters).toHaveLength(2);
            expect(modifiedRoomGame.game.fight.fighters[0].playerInGame.attributes.attack).toBe(EXPECTED_NO_DEBUFF_VALUE);
            expect(modifiedRoomGame.game.fight.fighters[0].playerInGame.attributes.attack).toBe(EXPECTED_NO_DEBUFF_VALUE);
            expect(modifiedRoomGame.game.fight.fighters[1].playerInGame.attributes.attack).toBe(2);
            expect(modifiedRoomGame.game.fight.fighters[1].playerInGame.attributes.attack).toBe(2);
            expect(modifiedRoomGame.game.fight.result.winner).toBeNull();
            expect(modifiedRoomGame.game.fight.result.loser).toBeNull();
            expect(modifiedRoomGame.game.fight.numbEvasionsLeft).toEqual([EVASION_COUNT, EVASION_COUNT]);
            expect(modifiedRoomGame.game.fight.currentFighter).toBe(1);
            expect(modifiedRoomGame.game.fight.hasPendingAction).toBe(false);
        });
    });

    describe('attack', () => {
        let fight: Fight;

        beforeEach(() => {
            fight = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT.game.fight));
        });

        it('should calculate attack result correctly when damage is dealt', () => {
            jest.spyOn(Math, 'random').mockReturnValueOnce(DIE_ROLL_5_RESULT).mockReturnValueOnce(DIE_ROLL_1_RESULT);

            const result = service.attack(fight);
            expect(result.hasDealtDamage).toBe(true);
            expect(result.wasWinningBlow).toBe(false);
            expect(fight.fighters[1].playerInGame.remainingHp).toBe(MOCK_FIGHTER_TWO.playerInGame.remainingHp - 1);
        });

        it('should handle winning blow', () => {
            fight.fighters[1].playerInGame.remainingHp = 1;
            jest.spyOn(Math, 'random').mockReturnValueOnce(DIE_ROLL_5_RESULT).mockReturnValueOnce(DIE_ROLL_1_RESULT);

            const result = service.attack(fight);

            expect(result.hasDealtDamage).toBe(true);
            expect(result.wasWinningBlow).toBe(true);
            expect(fight.result.winner).toBe(fight.fighters[0].playerInfo.userName);
            expect(fight.fighters[1].playerInGame.remainingHp).toBe(0);
        });

        it('should handle missed attacks', () => {
            jest.spyOn(Math, 'random').mockReturnValueOnce(DIE_ROLL_1_RESULT).mockReturnValueOnce(DIE_ROLL_6_RESULT);

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
                result: {
                    winner: null,
                    loser: null,
                },
                isFinished: false,
                numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
                currentFighter: 0,
                hasPendingAction: false,
                timer: MOCK_TIMER,
            };
        });

        it('should return false when no evasions left', () => {
            fight.numbEvasionsLeft[0] = 0;
            const result = service.escape(fight);
            expect(result).toBe(false);
        });

        it('should handle successful evasion', () => {
            jest.spyOn(Math, 'random').mockReturnValue(EVASION_PROBABILITY - DELTA_RANDOM);
            const result = service.escape(fight);
            expect(result).toBe(true);
            expect(fight.numbEvasionsLeft[0]).toBe(EVASION_COUNT);
        });

        it('should handle failed evasion', () => {
            jest.spyOn(Math, 'random').mockReturnValue(EVASION_PROBABILITY + DELTA_RANDOM);
            const result = service.escape(fight);
            expect(result).toBe(false);
            expect(fight.numbEvasionsLeft[0]).toBe(EVASION_COUNT - 1);
        });
    });

    describe('nextFightTurn', () => {
        it('should correctly cycle between fighters', () => {
            const fight: Fight = {
                fighters: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
                result: {
                    winner: null,
                    loser: null,
                },
                isFinished: false,
                numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
                currentFighter: 0,
                hasPendingAction: false,
                timer: MOCK_TIMER,
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
