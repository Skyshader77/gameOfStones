import { FOUR_TILED_MOCK_GAMEMAP } from '@app/constants/test-constants';
import { MovementNode } from '@app/interfaces/playerPosition';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerMovementService } from './player-movement.service';

describe('PlayerMovementService', () => {
    let service: PlayerMovementService;
    beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    PlayerMovementService,
                ],
            }).compile();
    
            service = module.get<PlayerMovementService>(PlayerMovementService);
            service.gameMap=FOUR_TILED_MOCK_GAMEMAP;
    });
    
        it('should be defined', () => {
            expect(service).toBeDefined();
        });


        it('should return true if the player is on ice', () => {
            const node: MovementNode = { x: 0, y: 1 };
            service.gameMap.map
            const result = service.isPlayerOnIce(node);
            expect(result).toBe(true);
        });
    
        it('should return false if the player is not on ice', () => {
            const node: MovementNode = { x: 0, y: 0 };
            const result = service.isPlayerOnIce(node);
            expect(result).toBe(false);
        });

        it('should return true approximately 10% of the time', () => {
            let trippedCount = 0;
            const iterations = 10000;
            for (let i = 0; i < iterations; i++) {
                if (service.hasPlayerTrippedOnIce()) {
                    trippedCount++;
                }
            }
    
            const probability = trippedCount / iterations;
            expect(probability).toBeGreaterThanOrEqual(0.08);
            expect(probability).toBeLessThanOrEqual(0.12); 
        });

        it('should update the player position correctly', () => {
            const newPosition: MovementNode = { x: 2, y: 2 };
            service.updatePlayerPosition(newPosition, 1);
    
            expect(service.gameMap.players[0].currentPosition).toEqual(newPosition);
        });
    
        it('should not update the position if player ID is not found', () => {
            const newPosition: MovementNode = { x: 2, y: 2 };
            service.updatePlayerPosition(newPosition, 99);
    
            expect(service.gameMap.players[0].currentPosition).toEqual({ x: 0, y: 0 });
            expect(service.gameMap.players[1].currentPosition).toEqual({ x: 1, y: 1 });
        });
    });