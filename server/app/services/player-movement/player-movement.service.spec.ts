import { FOUR_TILED_MOCK_GAMEMAP } from '@app/constants/test-constants';
import { Vec2 } from '@app/interfaces/playerPosition';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerMovementService } from './player-movement.service';

describe('PlayerMovementService', () => {
    let service: PlayerMovementService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayerMovementService],
        }).compile();

        service = module.get<PlayerMovementService>(PlayerMovementService);
        service.gameMap = JSON.parse(JSON.stringify(FOUR_TILED_MOCK_GAMEMAP)); 
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should set the map and the current player', () => {
        service.setGameMap(FOUR_TILED_MOCK_GAMEMAP, FOUR_TILED_MOCK_GAMEMAP.players[0])
        expect(service.gameMap).toBe(FOUR_TILED_MOCK_GAMEMAP);
        expect(service.currentPlayer).toBe(FOUR_TILED_MOCK_GAMEMAP.players[0]);
    });

    it('should return true if the player is on ice', () => {
        const node: Vec2 = { x: 0, y: 1 };
        const result = service.isPlayerOnIce(node);
        expect(result).toBe(true);
    });

    it('should return false if the player is not on ice', () => {
        const node: Vec2 = { x: 0, y: 0 };
        const result = service.isPlayerOnIce(node);
        expect(result).toBe(false);
    });

    it('should return true approximately 10% of the time', () => {
        let trippedCount = 0;
        const NUMB_ITERATIONS = 10000;
        const LOWER_BOUND_PROBABILITY=0.08;
        const UPPER_BOUND_PROBABILITY=0.12;
        for (let i = 0; i < NUMB_ITERATIONS; i++) {
            if (service.hasPlayerTrippedOnIce()) {
                trippedCount++;
            }
        }

        const probability = trippedCount / NUMB_ITERATIONS;
        expect(probability).toBeGreaterThanOrEqual(LOWER_BOUND_PROBABILITY);
        expect(probability).toBeLessThanOrEqual(UPPER_BOUND_PROBABILITY);
    });

    it('should update the player position correctly', () => {
        const newPosition: Vec2 = { x: 2, y: 2 };
        service.updatePlayerPosition(newPosition, 1);

        expect(service.gameMap.players[0].currentPosition).toEqual(newPosition);
    });

    it('should not update the position if player ID is not found', () => {
        const newPosition: Vec2 = { x: 2, y: 2 };
        const INVALID_POSITION=99;
        service.updatePlayerPosition(newPosition, INVALID_POSITION);

        expect(service.gameMap.players[0].currentPosition).toEqual({ x: 0, y: 0 });
        expect(service.gameMap.players[1].currentPosition).toEqual({ x: 1, y: 1 });
    });
});
