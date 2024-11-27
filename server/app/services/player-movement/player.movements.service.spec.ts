import { MOCK_MOVEMENT, MOCK_ROOM_GAMES, MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerMovementService } from './player-movement.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { ConditionalItemService } from '@app/services/conditional-item/conditional-item.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Socket } from 'socket.io';
describe('PlayerMovementService', () => {
    let service: PlayerMovementService;
    let mathRandomSpy: jest.SpyInstance;
    let isPlayerOnIceSpy: jest.SpyInstance;
    let isPlayerOnItemSpy: jest.SpyInstance;
    let hasPlayerTrippedOnIceSpy: jest.SpyInstance;
    let dijkstraService: PathFindingService;
    let roomManagerService: RoomManagerService;
    let socket: SinonStubbedInstance<Socket>;
    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        socket.data = {};
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayerMovementService,
                {
                    provide: PathFindingService,
                    useValue: {
                        dijkstraReachableTilesHuman: jest.fn().mockReturnValue(MOCK_MOVEMENT.reachableTiles),
                        getOptimalPath: jest.fn().mockReturnValue(MOCK_MOVEMENT.reachableTiles),
                        isAnotherPlayerPresentOnTile: jest.fn().mockReturnValue(false),
                        isCoordinateWithinBoundaries: jest.fn().mockReturnValue(true),
                    },
                },
                {
                    provide: GameStatsService,
                    useValue: {
                        processMovementStats: jest.fn(),
                    },
                },
                {
                    provide: ConditionalItemService,
                    useValue: {
                        areSapphireFinsApplied: jest.fn().mockReturnValue(false),
                    },
                },
                {
                    provide: RoomManagerService,
                    useValue: {
                        getCurrentRoomPlayer: jest.fn().mockReturnValue(MOCK_ROOM_GAMES.multiplePlayers.players[0]),
                        getRoom: jest.fn().mockReturnValue(MOCK_ROOM_GAMES.multiplePlayers),
                    },
                },
                {
                    provide: SocketManagerService,
                    useValue: {
                        getPlayerSocket: jest.fn().mockReturnValue(socket),
                    },
                },
            ],
        }).compile();
        roomManagerService = module.get<RoomManagerService>(RoomManagerService);
        service = module.get<PlayerMovementService>(PlayerMovementService);
        dijkstraService = module.get<PathFindingService>(PathFindingService);
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
        mathRandomSpy.mockReturnValue(MOVEMENT_CONSTANTS.game.ninePercent);
        expect(service.hasPlayerTrippedOnIce()).toBe(true);
    });

    it('should return false when random value is greater than 10%', () => {
        mathRandomSpy.mockReturnValue(MOVEMENT_CONSTANTS.game.fifteenPercent);
        expect(service.hasPlayerTrippedOnIce()).toBe(false);
    });

    it('should call getReachableTiles with correct parameters and return sample Reachable Tiles', () => {
        const result = service.getReachableTiles(MOCK_ROOM_GAMES.multiplePlayers, MOCK_ROOM_GAMES.multiplePlayers.players[0], false);
        expect(dijkstraService.dijkstraReachableTilesHuman).toHaveBeenCalledWith(
            MOCK_ROOM_GAMES.multiplePlayers.players,
            MOCK_ROOM_GAMES.multiplePlayers.game,
        );
        expect(result).toEqual(MOCK_MOVEMENT.reachableTiles);
    });

    it('should call findShortestPath with correct parameters and return a sample expected path', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));
        const destination: Vec2 = { x: 5, y: 5 };
        const result = service.calculateShortestPath(room, destination, false);
        expect(dijkstraService.dijkstraReachableTilesHuman).toHaveBeenCalledWith(room.players, room.game);
        expect(dijkstraService.getOptimalPath).toHaveBeenCalledWith(MOCK_MOVEMENT.reachableTiles, destination);
        expect(result).toEqual(MOCK_MOVEMENT.reachableTiles);
    });

    it('should not truncate the desired path if the player has not tripped', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        isPlayerOnIceSpy = jest.spyOn(service, 'isPlayerOnIce').mockReturnValue(false);
        hasPlayerTrippedOnIceSpy = jest.spyOn(service, 'hasPlayerTrippedOnIce').mockReturnValue(false);

        const result = service.executeHumanMove(MOCK_MOVEMENT.reachableTiles[0], room);
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

        const result = service.executeHumanMove(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTilesTruncated.path);
        expect(result.optimalPath.position).toEqual({ x: 0, y: 2 });
        expect(result.hasTripped).toBe(true);
        expect(hasPlayerTrippedOnIceSpy).toHaveBeenCalledTimes(1);
    });

    it('should not truncate the desired path if the AI player has not tripped', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        isPlayerOnIceSpy = jest.spyOn(service, 'isPlayerOnIce').mockReturnValue(false);
        hasPlayerTrippedOnIceSpy = jest.spyOn(service, 'hasPlayerTrippedOnIce').mockReturnValue(false);

        const result = service.executeBotMove(MOCK_MOVEMENT.reachableTiles[0], room);
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

        const result = service.executeHumanMove(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTilesTruncated.path);
        expect(result.optimalPath.position).toEqual({ x: 0, y: 2 });
        expect(result.hasTripped).toBe(true);
        expect(hasPlayerTrippedOnIceSpy).toHaveBeenCalledTimes(1);
    });

    it('should truncate the desired path if the AI player is on an item', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        isPlayerOnItemSpy = jest.spyOn(service, 'isPlayerOnItem').mockImplementation((node: Vec2) => {
            return node.x === 0 && node.y === 2;
        });

        const result = service.executeBotMove(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.position).toEqual({ x: 0, y: 2 });
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTilesTruncated.path);
    });

    it('should truncate the desired path if the AI player wants to go through a closed Door', () => {
        (roomManagerService.getCurrentRoomPlayer as jest.Mock).mockReturnValueOnce(MOCK_ROOM_GAMES.weird.players[0]);
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird));

        const result = service.executeBotMove(MOCK_MOVEMENT.reachableTilesAI[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.moveResults.virtualPlayerBeforeDoor.optimalPath.path);
        expect(result.optimalPath.position).toEqual({ x: 2, y: 1 });
    });

    it('should truncate the desired path if the AI player wants to go through a player', () => {
        (roomManagerService.getCurrentRoomPlayer as jest.Mock).mockReturnValueOnce(MOCK_ROOM_GAMES.weird.players[0]);
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird));
        const result = service.executeBotMove(MOCK_MOVEMENT.reachableTilesAI[1], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.moveResults.virtualPlayerBeforeHumanPlayer.optimalPath.path);
    });

    it('should truncate the desired path if the AI player wants to go beyond their movement limit', () => {
        (roomManagerService.getCurrentRoomPlayer as jest.Mock).mockReturnValueOnce(MOCK_ROOM_GAMES.weird.players[0]);
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird));
        const result = service.executeBotMove(MOCK_MOVEMENT.reachableTilesAI[2], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.moveResults.virtualPlayerExceedsMovementLimit.optimalPath.path);
        expect(result.optimalPath.remainingMovement).toEqual(0);
    });

    it('should not truncate the desired path if the player is not on an item ', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        isPlayerOnItemSpy = jest.spyOn(service, 'isPlayerOnItem').mockReturnValue(false);

        const result = service.executeHumanMove(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTiles[0].path);
        expect(isPlayerOnItemSpy).toHaveBeenCalledTimes(MOCK_MOVEMENT.reachableTiles[0].path.length);
        expect(result.hasTripped).toBe(false);
    });

    it('should truncate the desired path if the player is on an item', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        isPlayerOnItemSpy = jest.spyOn(service, 'isPlayerOnItem').mockImplementation((node: Vec2) => {
            return node.x === 0 && node.y === 2;
        });

        const result = service.executeHumanMove(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTilesTruncated.path);
        expect(result.optimalPath.position).toEqual({ x: 0, y: 2 });
    });

    it('should process a player movement and update the room accordingly', () => {
        const destination: Vec2 = { x: 5, y: 5 };

        const expectedOutput = {
            optimalPath: MOCK_MOVEMENT.reachableTiles[0],
            hasTripped: false,
            isOnItem: false,
            isNextToInteractableObject: false,
        };

        const calculateShortestPathSpy = jest.spyOn(service, 'calculateShortestPath').mockReturnValue(MOCK_MOVEMENT.reachableTiles[0]);
        const executeShortestPathSpy = jest.spyOn(service, 'executePathForPlayer').mockReturnValue(expectedOutput);
        const result = service.executePlayerMovement(destination, MOCK_ROOM_GAMES.multiplePlayers, false);

        expect(calculateShortestPathSpy).toHaveBeenCalledTimes(1);
        expect(executeShortestPathSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedOutput);
    });
});
