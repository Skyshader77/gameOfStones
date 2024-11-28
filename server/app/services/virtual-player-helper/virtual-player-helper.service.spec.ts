import { Test, TestingModule } from '@nestjs/testing';
import { VirtualPlayerHelperService } from './virtual-player-helper.service';

describe('VirtualPlayerHelperService', () => {
    let service: VirtualPlayerHelperService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [VirtualPlayerHelperService],
        }).compile();

        service = module.get<VirtualPlayerHelperService>(VirtualPlayerHelperService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
