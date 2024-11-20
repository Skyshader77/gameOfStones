import { Test, TestingModule } from '@nestjs/testing';
import { TurnInfoService } from './turn-info.service';

describe('TurnInfoService', () => {
    let service: TurnInfoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TurnInfoService],
        }).compile();

        service = module.get<TurnInfoService>(TurnInfoService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
