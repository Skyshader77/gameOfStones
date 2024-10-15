import {
    MOCK_GAME_MULTIPLE_PLAYERS
} from '@app/constants/test-constants';
import { DijstraService } from '@app/services/disjtra/dijstra.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerMovementService } from './player-movement.service';
describe('PlayerMovementService', () => {
    let service: PlayerMovementService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayerMovementService, DijstraService],
        }).compile();
        service = module.get<PlayerMovementService>(PlayerMovementService);
        service.gameMap = JSON.parse(JSON.stringify(MOCK_GAME_MULTIPLE_PLAYERS));
        service.currentPlayer = JSON.parse(JSON.stringify(MOCK_GAME_MULTIPLE_PLAYERS.players[0]));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should set the map and the current player', () => {
        service.setGameMap(MOCK_GAME_MULTIPLE_PLAYERS, MOCK_GAME_MULTIPLE_PLAYERS.players[0]);
        expect(service.gameMap).toBe(MOCK_GAME_MULTIPLE_PLAYERS);
        expect(service.currentPlayer).toBe(MOCK_GAME_MULTIPLE_PLAYERS.players[0]);
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
        const LOWER_BOUND_PROBABILITY = 0.08;
        const UPPER_BOUND_PROBABILITY = 0.12;
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
        service.updatePlayerPosition(newPosition, '1');

        expect(service.gameMap.players[0].playerInGame.currentPosition).toEqual(newPosition);
    });

    it('should not update the position if player ID is not found', () => {
        const newPosition: Vec2 = { x: 2, y: 2 };
        const INVALID_ID = "Othmane";
        service.updatePlayerPosition(newPosition, INVALID_ID);

        expect(service.gameMap.players[0].playerInGame.currentPosition).toEqual({ x: 0, y: 0 });
        expect(service.gameMap.players[1].playerInGame.currentPosition).toEqual({ x: 0, y: 1 });
    });
});
