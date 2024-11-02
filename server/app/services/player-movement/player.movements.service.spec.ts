import { CONSTANTS, MOCK_MOVEMENT, MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { MOCK_ROOM } from '@app/constants/test.constants';
import { PathfindingService } from '@app/services/dijkstra/dijkstra.service';
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
    let dijkstraService: PathfindingService;

    beforeEach(async () => {
        jest.clearAllMocks();

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
                {
                    provide: PathfindingService,
                    useValue: {
                        dijkstraReachableTiles: jest.fn().mockReturnValue(MOCK_MOVEMENT.reachableTiles),
                        getOptimalPath: jest.fn().mockReturnValue(MOCK_MOVEMENT.reachableTiles),
                        isAnotherPlayerPresentOnTile: jest.fn().mockReturnValue(false),
                        isCoordinateWithinBoundaries: jest.fn().mockReturnValue(true),
                    },
                },
            ],
        }).compile();

        service = module.get<PlayerMovementService>(PlayerMovementService);
        dijkstraService = module.get<PathfindingService>(PathfindingService);
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
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor));
        const node: Vec2 = { x: 1, y: 0 };
        const result = service.isPlayerOnIce(node, room);
        expect(result).toBe(true);
    });

    it('should return false if the player is not on ice', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor));
        const node: Vec2 = { x: 0, y: 0 };
        const result = service.isPlayerOnIce(node, room);
        expect(result).toBe(false);
    });

    it('should return true when random value is less than 10%', () => {
        mathRandomSpy.mockReturnValue(CONSTANTS.game.ninePercent);
        expect(service.hasPlayerTrippedOnIce()).toBe(true);
    });

    it('should return false when random value is greater than 10%', () => {
        mathRandomSpy.mockReturnValue(CONSTANTS.game.fifteenPercent);
        expect(service.hasPlayerTrippedOnIce()).toBe(false);
    });

    it('should call getReachableTiles with correct parameters and return sample Reachable Tiles', () => {
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_GAMES.multiplePlayers);
        const result = service.getReachableTiles(MOCK_ROOM.roomCode);
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM.roomCode);
        expect(dijkstraService.dijkstraReachableTiles).toHaveBeenCalledWith(
            MOCK_ROOM_GAMES.multiplePlayers.players,
            MOCK_ROOM_GAMES.multiplePlayers.game,
        );
        expect(result).toEqual(MOCK_MOVEMENT.reachableTiles);
    });

    it('should call findShortestPath with correct parameters and return a sample expected path', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));
        const destination: Vec2 = { x: 5, y: 5 };
        const result = service.calculateShortestPath(room, destination);
        expect(dijkstraService.dijkstraReachableTiles).toHaveBeenCalledWith(room.players, room.game);
        expect(dijkstraService.getOptimalPath).toHaveBeenCalledWith(MOCK_MOVEMENT.reachableTiles, destination);
        expect(result).toEqual(MOCK_MOVEMENT.reachableTiles);
    });

    it('should not truncate the desired path if the player has not tripped', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        isPlayerOnIceSpy = jest.spyOn(service, 'isPlayerOnIce').mockReturnValue(false);
        hasPlayerTrippedOnIceSpy = jest.spyOn(service, 'hasPlayerTrippedOnIce').mockReturnValue(false);

        const result = service.executeShortestPath(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTiles[0].path);
        expect(isPlayerOnIceSpy).toHaveBeenCalledTimes(MOCK_MOVEMENT.reachableTiles[0].path.length);
        expect(result.hasTripped).toBe(false);
        expect(hasPlayerTrippedOnIceSpy).not.toHaveBeenCalled();
    });

    it('should truncate the desired path if the player has tripped', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        isPlayerOnIceSpy = jest.spyOn(service, 'isPlayerOnIce').mockImplementation((node: Vec2) => {
            return node.x === 0 && node.y === 2;
        });
        hasPlayerTrippedOnIceSpy = jest.spyOn(service, 'hasPlayerTrippedOnIce').mockReturnValue(true);

        const result = service.executeShortestPath(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTilesTruncated.path);
        expect(result.optimalPath.position).toEqual({ x: 0, y: 2 });
        expect(result.hasTripped).toBe(true);
        expect(hasPlayerTrippedOnIceSpy).toHaveBeenCalledTimes(1);
    });

    it('should process a player movement and update the room accordingly', () => {
        const destination: Vec2 = { x: 5, y: 5 };

        const expectedOutput = {
            optimalPath: MOCK_MOVEMENT.reachableTiles[0],
            hasTripped: false,
        };

        const calculateShortestPathSpy = jest.spyOn(service, 'calculateShortestPath').mockReturnValue(MOCK_MOVEMENT.reachableTiles[0]);

        const executeShortestPathSpy = jest.spyOn(service, 'executeShortestPath').mockReturnValue(expectedOutput);
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_GAMES.multiplePlayers);
        const result = service.processPlayerMovement(destination, MOCK_ROOM.roomCode);

        expect(calculateShortestPathSpy).toHaveBeenCalledTimes(1);
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM.roomCode);
        expect(executeShortestPathSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedOutput);
    });
});
