import { Test, TestingModule } from '@nestjs/testing';
import { VirtualPlayerCreationService } from './virtual-player-creation.service';

describe('VirtualPlayerBehaviorService', () => {
    let service: VirtualPlayerCreationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [VirtualPlayerCreationService],
        }).compile();

        service = module.get<VirtualPlayerCreationService>(VirtualPlayerCreationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
