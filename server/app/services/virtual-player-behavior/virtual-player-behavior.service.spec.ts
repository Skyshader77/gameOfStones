import { Test, TestingModule } from '@nestjs/testing';
import { PlayerMovementService } from '../player-movement/player-movement.service';
import { VirtualPlayerBehaviorService } from './virtual-player-behavior.service';

describe('VirtualPlayerBehaviorService', () => {
    let service: VirtualPlayerBehaviorService;
    let playerMovementService: PlayerMovementService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [VirtualPlayerBehaviorService, { provide: PlayerMovementService, useValue: {} }],
        }).compile();

        service = module.get<VirtualPlayerBehaviorService>(VirtualPlayerBehaviorService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
