import { Test, TestingModule } from '@nestjs/testing';
import { VirtualPlayerStateService } from './virtual-player-state.service';

describe('VirtualPlayerStateService', () => {
    let service: VirtualPlayerStateService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [VirtualPlayerStateService],
        }).compile();

        service = module.get<VirtualPlayerStateService>(VirtualPlayerStateService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
