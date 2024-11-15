import {
    DIE_ROLL_1_RESULT,
    DIE_ROLL_5_RESULT,
    DIE_ROLL_6_RESULT,
    MOCK_FIGHTER_ONE,
    MOCK_FIGHTER_TWO,
    MOCK_ROOM_COMBAT,
    MOCK_ROOM_COMBAT_CONFLICT_START_POSITIONS,
    MOCK_ROOM_COMBAT_ICE,
} from '@app/constants/combat.test.constants';
import { TERRAIN_PATTERNS } from '@app/constants/player.movement.test.constants';
import { DELTA_RANDOM, MOCK_TIMER } from '@app/constants/test.constants';
import { TimerDuration } from '@app/constants/time.constants';
import { Fight, Game } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { FightLogicService } from './fight-logic.service';
import { EVASION_COUNT, EVASION_PROBABILITY } from './fight.service.constants';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';

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
                {
                    provide: GameStatsService,
                    useValue: { processAttackDamageStats: jest.fn().mockReturnValue(MOCK_TIMER), processSuccessfulEvadeStats: jest.fn() },
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
            expect(modifiedRoomGame.game.fight.fighters[1].playerInGame.attributes.attack).toBe(EXPECTED_NO_DEBUFF_VALUE);
            expect(modifiedRoomGame.game.fight.fighters[1].playerInGame.attributes.attack).toBe(EXPECTED_NO_DEBUFF_VALUE);
            expect(modifiedRoomGame.game.fight.result.winner).toBeNull();
            expect(modifiedRoomGame.game.fight.result.loser).toBeNull();
            expect(modifiedRoomGame.game.fight.numbEvasionsLeft).toEqual([EVASION_COUNT, EVASION_COUNT]);
            expect(modifiedRoomGame.game.fight.currentFighter).toBe(1);
            expect(modifiedRoomGame.game.fight.hasPendingAction).toBe(false);
        });
    });

    describe('attack', () => {
        let fight: Fight;
        let fightRoom: RoomGame;

        beforeEach(() => {
            fight = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT.game.fight));
            fightRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT));
        });

        it('should calculate attack result correctly when damage is dealt', () => {
            jest.spyOn(Math, 'random').mockReturnValueOnce(DIE_ROLL_5_RESULT).mockReturnValueOnce(DIE_ROLL_1_RESULT);

            const result = service.attack(fightRoom);
            expect(result.hasDealtDamage).toBe(true);
            expect(result.wasWinningBlow).toBe(false);
            expect(fightRoom.game.fight.fighters[1].playerInGame.remainingHp).toBe(MOCK_FIGHTER_TWO.playerInGame.attributes.hp - 1);
        });

        it('should calculate attack result correctly when damage is dealt on an ice map', () => {
            fightRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT_ICE));
            jest.spyOn(Math, 'random').mockReturnValueOnce(DIE_ROLL_5_RESULT).mockReturnValueOnce(DIE_ROLL_5_RESULT);

            const result = service.attack(fightRoom);
            expect(result.hasDealtDamage).toBe(false);
            expect(result.wasWinningBlow).toBe(false);
            expect(fightRoom.game.fight.fighters[1].playerInGame.remainingHp).toBe(MOCK_FIGHTER_TWO.playerInGame.attributes.hp);
        });

        it('should handle winning blow and not move a player to another player tile if that player occupies their start position', () => {
            fightRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT_CONFLICT_START_POSITIONS));
            fightRoom.game.fight.fighters[1].playerInGame.remainingHp = 1;
            jest.spyOn(Math, 'random').mockReturnValueOnce(DIE_ROLL_5_RESULT).mockReturnValueOnce(DIE_ROLL_1_RESULT);
            const result = service.attack(fightRoom);

            expect(result.hasDealtDamage).toBe(true);
            expect(result.wasWinningBlow).toBe(true);
            expect(fightRoom.game.fight.result.winner).toBe(fightRoom.game.fight.fighters[0].playerInfo.userName);

            expect(fightRoom.game.fight.fighters[1].playerInGame.remainingHp).toBe(0);
            expect(fightRoom.players[1].playerInGame.currentPosition).not.toBe({ x: 1, y: 0 });
            expect(fightRoom.game.fight.result.respawnPosition.x).not.toBe({ x: 1, y: 0 });
        });

        it('should handle winning blow', () => {
            fightRoom.game.fight.fighters[1].playerInGame.remainingHp = 1;
            jest.spyOn(Math, 'random').mockReturnValueOnce(DIE_ROLL_5_RESULT).mockReturnValueOnce(DIE_ROLL_1_RESULT);

            const result = service.attack(fightRoom);

            expect(result.hasDealtDamage).toBe(true);
            expect(result.wasWinningBlow).toBe(true);
            expect(fightRoom.game.fight.result.winner).toBe(fightRoom.game.fight.fighters[0].playerInfo.userName);
            expect(fightRoom.game.fight.result.respawnPosition.x).toBe(2);
            expect(fightRoom.game.fight.result.respawnPosition.y).toBe(2);
            expect(fightRoom.game.fight.fighters[1].playerInGame.remainingHp).toBe(0);
        });

        it('should handle missed attacks', () => {
            jest.spyOn(Math, 'random').mockReturnValueOnce(DIE_ROLL_1_RESULT).mockReturnValueOnce(DIE_ROLL_6_RESULT);

            const result = service.attack(fightRoom);

            expect(result.hasDealtDamage).toBe(false);
            expect(result.wasWinningBlow).toBe(false);
            expect(fight.fighters[1].playerInGame.remainingHp).toBe(MOCK_FIGHTER_TWO.playerInGame.remainingHp);
        });
    });

    describe('evade', () => {
        let room: RoomGame;

        beforeEach(() => {
            const fight = {
                fighters: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
                result: {
                    winner: null,
                    loser: null,
                    respawnPosition: { x: 0, y: 0 },
                },
                isFinished: false,
                numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
                currentFighter: 0,
                hasPendingAction: false,
                timer: MOCK_TIMER,
            };
            room = { game: { fight } as Game } as RoomGame;
        });

        it('should return false when no evasions left', () => {
            room.game.fight.numbEvasionsLeft[0] = 0;
            const result = service.escape(room);
            expect(result).toBe(false);
        });

        it('should handle successful evasion', () => {
            jest.spyOn(Math, 'random').mockReturnValue(EVASION_PROBABILITY - DELTA_RANDOM);
            const result = service.escape(room);
            expect(result).toBe(true);
            expect(room.game.fight.numbEvasionsLeft[0]).toBe(EVASION_COUNT);
        });

        it('should handle failed evasion', () => {
            jest.spyOn(Math, 'random').mockReturnValue(EVASION_PROBABILITY + DELTA_RANDOM);
            const result = service.escape(room);
            expect(result).toBe(false);
            expect(room.game.fight.numbEvasionsLeft[0]).toBe(EVASION_COUNT - 1);
        });

        it('should get the rightTurnTime for positive evasion values', () => {
            expect(service.getTurnTime(room.game.fight)).toBe(TimerDuration.FightTurnEvasion);
        });
        it('should get the rightTurnTime for expired evasion values', () => {
            const fightNoEvasion: Fight = {
                fighters: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
                result: {
                    winner: null,
                    loser: null,
                    respawnPosition: { x: 0, y: 0 },
                },
                isFinished: false,
                numbEvasionsLeft: [0, 0],
                currentFighter: 0,
                hasPendingAction: false,
                timer: MOCK_TIMER,
            };
            expect(service.getTurnTime(fightNoEvasion)).toBe(TimerDuration.FightTurnNoEvasion);
        });

        it('should get return true for isCurrentFighter for player 1', () => {
            expect(service.isCurrentFighter(room.game.fight, MOCK_FIGHTER_ONE.playerInfo.userName)).toBe(true);
        });

        it('should get return false for isCurrentFighter for player 2', () => {
            expect(service.isCurrentFighter(room.game.fight, MOCK_FIGHTER_TWO.playerInfo.userName)).toBe(false);
        });
    });

    describe('nextFightTurn', () => {
        it('should correctly cycle between fighters', () => {
            const fight: Fight = {
                fighters: [MOCK_FIGHTER_ONE, MOCK_FIGHTER_TWO],
                result: {
                    winner: null,
                    loser: null,
                    respawnPosition: { x: 0, y: 0 },
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
