import { Test, TestingModule } from '@nestjs/testing';
import { GameStartService } from './game-start.service';

describe('GameStartService', () => {
    let service: GameStartService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameStartService],
        }).compile();

        service = module.get<GameStartService>(GameStartService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
