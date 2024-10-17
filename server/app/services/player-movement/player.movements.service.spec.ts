import { FIFTEEN_PERCENT, MOCK_ROOM_GAME_CORRIDOR, MOCK_ROOM_MULTIPLE_PLAYERS, NINE_PERCENT } from '@app/constants/player.movement.test.constants';
import { DijsktraService } from '@app/services/dijkstra/dijkstra.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { PlayerMovementService } from './player-movement.service';
describe('PlayerMovementService', () => {
    let service: PlayerMovementService;
    let mathRandomStub: sinon.SinonStub;
    let dijsktraServiceStub: sinon.SinonStubbedInstance<DijsktraService>;
    let stubIsPlayerOnIce: sinon.SinonStub;
    let stubHasPlayerTrippedOnIce: sinon.SinonStub;
    beforeEach(async () => {
        dijsktraServiceStub = sinon.createStubInstance(DijsktraService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayerMovementService, { provide: DijsktraService, useValue: dijsktraServiceStub }],
        }).compile();
        service = module.get<PlayerMovementService>(PlayerMovementService);
        service.room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        service.currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0]));
        mathRandomStub = sinon.stub(Math, 'random');
    });

    afterEach(() => {
        mathRandomStub.restore();
        sinon.restore();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should set the map and the current player', () => {
        service.setGameRoom(MOCK_ROOM_MULTIPLE_PLAYERS, MOCK_ROOM_MULTIPLE_PLAYERS.players[0]);
        expect(service.room).toBe(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(service.currentPlayer).toBe(MOCK_ROOM_MULTIPLE_PLAYERS.players[0]);
    });

    it('should return true if the player is on ice', () => {
        service.setGameRoom(MOCK_ROOM_GAME_CORRIDOR, MOCK_ROOM_GAME_CORRIDOR.players[0]);
        const node: Vec2 = { x: 0, y: 1 };
        const result = service.isPlayerOnIce(node);
        expect(result).toBe(true);
    });

    it('should return false if the player is not on ice', () => {
        const node: Vec2 = { x: 0, y: 0 };
        const result = service.isPlayerOnIce(node);
        expect(result).toBe(false);
    });

    it('should update the player position correctly', () => {
        const newPosition: Vec2 = { x: 2, y: 2 };
        service.updatePlayerPosition(newPosition, '1');
        expect(service.room.players[0].playerInGame.currentPosition).toEqual(newPosition);
    });

    it('should return true when random value is less than 10%', () => {
        mathRandomStub.returns(NINE_PERCENT);
        expect(service.hasPlayerTrippedOnIce()).toBe(true);
    });

    it('should return false when random value is greater than 10%', () => {
        mathRandomStub.returns(FIFTEEN_PERCENT);
        expect(service.hasPlayerTrippedOnIce()).toBe(false);
    });

    it('should not update the position if player ID is not found', () => {
        const newPosition: Vec2 = { x: 2, y: 2 };
        const INVALID_ID = 'Othmane';
        service.updatePlayerPosition(newPosition, INVALID_ID);

        expect(service.room.players[0].playerInGame.currentPosition).toEqual({ x: 0, y: 0 });
        expect(service.room.players[1].playerInGame.currentPosition).toEqual({ x: 0, y: 1 });
    });

    it('should call findShortestPath with correct parameters and return a sample expected path', () => {
        const destination: Vec2 = { x: 5, y: 5 };
        const expectedPath: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 5 },
        ];

        dijsktraServiceStub.findShortestPath.returns(expectedPath);
        const result = service.calculateShortestPath(destination);
        expect(result).toEqual(expectedPath);
    });

    it('should not truncate the desired path if the player has not tripped', () => {
        const desiredPath: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 5 },
        ];

        stubIsPlayerOnIce = sinon.stub(service, 'isPlayerOnIce');
        stubHasPlayerTrippedOnIce = sinon.stub(service, 'hasPlayerTrippedOnIce');
        stubIsPlayerOnIce.returns(false);
        stubHasPlayerTrippedOnIce.returns(false);
        const result = service.executeShortestPath(desiredPath);
        expect(result.displacementVector).toEqual(desiredPath);
        expect(stubIsPlayerOnIce.callCount).toBe(desiredPath.length);
        expect(result.hasTripped).toBe(false);
        expect(stubHasPlayerTrippedOnIce.callCount).toBe(0);
    });

    it('should truncate the desired path if the player has tripped', () => {
        const desiredPath: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 5 },
        ];
        stubIsPlayerOnIce = sinon.stub(service, 'isPlayerOnIce');
        stubHasPlayerTrippedOnIce = sinon.stub(service, 'hasPlayerTrippedOnIce');

        stubIsPlayerOnIce.callsFake((node: Vec2) => {
            return node.x === 1 && node.y === 1;
        });
        stubHasPlayerTrippedOnIce.returns(true);

        const result = service.executeShortestPath(desiredPath);
        expect(result.displacementVector).toEqual([
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ]);
        expect(result.hasTripped).toBe(true);
        expect(stubHasPlayerTrippedOnIce.callCount).toBe(1);
    });
});
