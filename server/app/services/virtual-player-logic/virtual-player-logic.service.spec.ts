import { Test, TestingModule } from '@nestjs/testing';
import { VirtualPlayerLogicService } from './virtual-player-logic.service';

describe('VirtualPlayerBehaviorService', () => {
    let service: VirtualPlayerLogicService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [VirtualPlayerLogicService],
        }).compile();

        service = module.get<VirtualPlayerLogicService>(VirtualPlayerLogicService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
