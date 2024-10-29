import {
    FIFTEEN_PERCENT,
    MOCK_REACHABLE_TILES,
    MOCK_REACHABLE_TILE_TRUNCATED,
    MOCK_ROOM_GAME_CORRIDOR,
    MOCK_ROOM_MULTIPLE_PLAYERS,
    NINE_PERCENT,
} from '@app/constants/player.movement.test.constants';
import { MOCK_ROOM } from '@app/constants/test.constants';
import { Pathfinding } from '@app/services/dijkstra/dijkstra.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerMovementService } from './player-movement.service';

describe('PlayerMovementService', () => {
    let service: PlayerMovementService;
    let mathRandomSpy: jest.SpyInstance;
    let roomManagerService: RoomManagerService;
    let isPlayerOnIceSpy: jest.SpyInstance;
    let hasPlayerTrippedOnIceSpy: jest.SpyInstance;

    const pathfindingMock = {
        dijkstraReachableTiles: jest.fn().mockReturnValue(MOCK_REACHABLE_TILES),
        getOptimalPath: jest.fn().mockReturnValue(MOCK_REACHABLE_TILES[0]),
        isAnotherPlayerPresentOnTile: jest.fn().mockReturnValue(false),
        isCoordinateWithinBoundaries: jest.fn().mockReturnValue(true),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.spyOn(Pathfinding, 'dijkstraReachableTiles').mockImplementation(pathfindingMock.dijkstraReachableTiles);
        jest.spyOn(Pathfinding, 'getOptimalPath').mockImplementation(pathfindingMock.getOptimalPath);
        jest.spyOn(Pathfinding, 'isAnotherPlayerPresentOnTile').mockImplementation(pathfindingMock.isAnotherPlayerPresentOnTile);
        jest.spyOn(Pathfinding, 'isCoordinateWithinBoundaries').mockImplementation(pathfindingMock.isCoordinateWithinBoundaries);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayerMovementService,
                {
                    provide: RoomManagerService,
                    useValue: {
                        getRoom: jest.fn(),
                        updateRoom: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PlayerMovementService>(PlayerMovementService);
        roomManagerService = module.get<RoomManagerService>(RoomManagerService);
        mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return true if the player is on ice', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR));
        const node: Vec2 = { x: 0, y: 1 };
        const result = service.isPlayerOnIce(node, room);
        expect(result).toBe(true);
    });

    it('should return false if the player is not on ice', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR));
        const node: Vec2 = { x: 0, y: 0 };
        const result = service.isPlayerOnIce(node, room);
        expect(result).toBe(false);
    });

    it('should return true when random value is less than 10%', () => {
        mathRandomSpy.mockReturnValue(NINE_PERCENT);
        expect(service.hasPlayerTrippedOnIce()).toBe(true);
    });

    it('should return false when random value is greater than 10%', () => {
        mathRandomSpy.mockReturnValue(FIFTEEN_PERCENT);
        expect(service.hasPlayerTrippedOnIce()).toBe(false);
    });

    it('should call getReachableTiles with correct parameters and return sample Reachable Tiles', () => {
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_MULTIPLE_PLAYERS);
        const result = service.getReachableTiles(MOCK_ROOM.roomCode);
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM.roomCode);
        expect(pathfindingMock.dijkstraReachableTiles).toHaveBeenCalledWith(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(result).toEqual(MOCK_REACHABLE_TILES);
    });

    it('should call findShortestPath with correct parameters and return a sample expected path', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        const destination: Vec2 = { x: 5, y: 5 };
        const result = service.calculateShortestPath(room, destination);
        expect(pathfindingMock.dijkstraReachableTiles).toHaveBeenCalledWith(room);
        expect(pathfindingMock.getOptimalPath).toHaveBeenCalledWith(MOCK_REACHABLE_TILES, destination);
        expect(result).toEqual(MOCK_REACHABLE_TILES[0]);
    });

    it('should not truncate the desired path if the player has not tripped', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));

        isPlayerOnIceSpy = jest.spyOn(service, 'isPlayerOnIce').mockReturnValue(false);
        hasPlayerTrippedOnIceSpy = jest.spyOn(service, 'hasPlayerTrippedOnIce').mockReturnValue(false);

        const result = service.executeShortestPath(MOCK_REACHABLE_TILES[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_REACHABLE_TILES[0].path);
        expect(isPlayerOnIceSpy).toHaveBeenCalledTimes(MOCK_REACHABLE_TILES[0].path.length);
        expect(result.hasTripped).toBe(false);
        expect(hasPlayerTrippedOnIceSpy).not.toHaveBeenCalled();
    });

    it('should truncate the desired path if the player has tripped', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));

        isPlayerOnIceSpy = jest.spyOn(service, 'isPlayerOnIce').mockImplementation((node: Vec2) => {
            return node.x === 0 && node.y === 2;
        });
        hasPlayerTrippedOnIceSpy = jest.spyOn(service, 'hasPlayerTrippedOnIce').mockReturnValue(true);

        const result = service.executeShortestPath(MOCK_REACHABLE_TILES[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_REACHABLE_TILE_TRUNCATED.path);
        expect(result.optimalPath.position).toEqual({ x: 0, y: 2 });
        expect(result.hasTripped).toBe(true);
        expect(hasPlayerTrippedOnIceSpy).toHaveBeenCalledTimes(1);
    });

    it('should process a player movement and update the room accordingly', () => {
        const destination: Vec2 = { x: 5, y: 5 };

        const expectedOutput = {
            optimalPath: MOCK_REACHABLE_TILES[0],
            hasTripped: false,
        };

        const calculateShortestPathSpy = jest.spyOn(service, 'calculateShortestPath').mockReturnValue(MOCK_REACHABLE_TILES[0]);

        const executeShortestPathSpy = jest.spyOn(service, 'executeShortestPath').mockReturnValue(expectedOutput);
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_MULTIPLE_PLAYERS);
        const result = service.processPlayerMovement(destination, MOCK_ROOM.roomCode);

        expect(calculateShortestPathSpy).toHaveBeenCalledTimes(1);
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM.roomCode);
        expect(executeShortestPathSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedOutput);
    });
});
