import { MOCK_ROOM_ONE_AI } from '@app/constants/combat.test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { VirtualPlayerHelperService } from './virtual-player-helper.service';

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
});
