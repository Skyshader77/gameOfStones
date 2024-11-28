import { Test, TestingModule } from '@nestjs/testing';
import { VirtualPlayerHelperService } from './virtual-player-helper.service';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

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
});
