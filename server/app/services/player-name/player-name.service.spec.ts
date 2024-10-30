import { Test, TestingModule } from '@nestjs/testing';
import { PlayerNameService } from './player-name.service';

describe('RoomManagerService', () => {
    let service: PlayerNameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayerNameService],
        }).compile();

        service = module.get<PlayerNameService>(PlayerNameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
