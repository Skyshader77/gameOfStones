import { MOCK_ROOM_ONE_AI } from '@app/constants/combat.test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { VirtualPlayerHelperService } from './virtual-player-helper.service';
import { MAX_AI_ACTION_DELAY, MIN_AI_ACTION_DELAY } from '@app/constants/virtual-player.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';

describe('VirtualPlayerHelperService', () => {
    let service: VirtualPlayerHelperService;
    let fightLogicService: SinonStubbedInstance<FightLogicService>;

    beforeEach(async () => {
        fightLogicService = createStubInstance<FightLogicService>(FightLogicService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [VirtualPlayerHelperService, { provide: FightLogicService, useValue: fightLogicService }],
        }).compile();

        service = module.get<VirtualPlayerHelperService>(VirtualPlayerHelperService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return a random interval between the boundaries', () => {
        const interval = service.getRandomAIActionInterval();
        expect(interval).toBeLessThanOrEqual(MAX_AI_ACTION_DELAY);
        expect(interval).toBeGreaterThanOrEqual(MIN_AI_ACTION_DELAY);
    });

    describe('isCurrentFighterAI', () => {
        it('should return true when current fighter is AI', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ONE_AI)) as RoomGame;
            fightLogicService.isCurrentFighter.returns(false);

            const result = service['isCurrentFighterAI'](room, 'Player1');

            expect(result).toBe(true);
        });

        it('should return false when current fighter is human', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ONE_AI)) as RoomGame;
            fightLogicService.isCurrentFighter.returns(true);

            const result = service['isCurrentFighterAI'](room, 'Player1');

            expect(result).toBe(false);
        });

        it('should return false when fight is undefined', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ONE_AI)) as RoomGame;
            room.game.fight = undefined;

            const result = service['isCurrentFighterAI'](room, 'Player1');

            expect(result).toBe(false);
        });
    });

    describe('areTwoAIsFighting', () => {
        it('should return false if no fight exists', () => {
            const room = { game: { fight: undefined } } as RoomGame;

            const result = service.areTwoAIsFighting(room);

            expect(result).toBe(false);
        });

        it('should return false if at least one fighter is human', () => {
            const room = {
                game: {
                    fight: {
                        fighters: [{ playerInfo: { role: PlayerRole.Human } }, { playerInfo: { role: PlayerRole.Human } }],
                    },
                },
            } as unknown as RoomGame;

            const result = service.areTwoAIsFighting(room);

            expect(result).toBe(false);
        });

        it('should return true if all fighters are AI', () => {
            const room = {
                game: {
                    fight: {
                        fighters: [{ playerInfo: { role: PlayerRole.AggressiveAI } }, { playerInfo: { role: PlayerRole.AggressiveAI } }],
                    },
                },
            } as unknown as RoomGame;

            const result = service.areTwoAIsFighting(room);

            expect(result).toBe(true);
        });
    });

    describe('determineAIBattleWinner', () => {
        it('should return distinct winner and loser indices', () => {
            const results = [];
            const SIZE = 10;
            for (let i = 0; i < SIZE; i++) {
                const result = service.determineAIBattleWinner();
                expect(result.loserIndex).not.toEqual(result.winnerIndex);
                expect([0, 1]).toContain(result.loserIndex);
                expect([0, 1]).toContain(result.winnerIndex);
                results.push(result);
            }
            // Ensure randomness (both indices should appear in the results)
            expect(results.some((res) => res.loserIndex === 0 && res.winnerIndex === 1)).toBe(true);
            expect(results.some((res) => res.loserIndex === 1 && res.winnerIndex === 0)).toBe(true);
        });
    });

    describe('remainingDefensiveItemCount', () => {
        it('should return the count of defensive items in the room', () => {
            const room = {
                game: {
                    map: {
                        placedItems: [{ type: ItemType.BismuthShield }, { type: ItemType.Flag }, { type: ItemType.Random }],
                    },
                },
            } as unknown as RoomGame;

            const result = service.remainingDefensiveItemCount(room);

            expect(result).toEqual(2);
        });

        it('should return 0 if no defensive items are present', () => {
            const room = {
                game: {
                    map: {
                        placedItems: [{ type: ItemType.GlassStone }, { type: ItemType.Random }],
                    },
                },
            } as unknown as RoomGame;

            const result = service.remainingDefensiveItemCount(room);

            expect(result).toEqual(0);
        });
    });
});
