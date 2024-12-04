/* eslint-disable */
import { MOCK_MOVEMENT, MOCK_ROOM_GAMES, MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { MovementFlags } from '@app/interfaces/movement';
import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { ConditionalItemService } from '@app/services/item/conditional-item/conditional-item.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { ItemType } from '@common/enums/item-type.enum';
import { MovementServiceOutput, PathNode, ReachableTile } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Socket } from 'socket.io';
import { PlayerMovementService } from './player-movement.service';
describe('PlayerMovementService', () => {
    let service: PlayerMovementService;
    let mathRandomSpy: jest.SpyInstance;
    let dijkstraService: PathFindingService;
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
                        dijkstraReachableTilesAlgo: jest.fn().mockReturnValue(MOCK_MOVEMENT.reachableTiles),
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
        const result = service['isPlayerOnIce'](node, room);
        expect(result).toBe(true);
    });

    it('should return false if the player is not on ice', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor));
        const node: Vec2 = { x: 0, y: 0 };
        const result = service['isPlayerOnIce'](node, room);
        expect(result).toBe(false);
    });

    it('should return true when random value is less than 10%', () => {
        mathRandomSpy.mockReturnValue(MOVEMENT_CONSTANTS.game.ninePercent);
        expect(service['hasPlayerTrippedOnIce']()).toBe(true);
    });

    it('should return false when random value is greater than 10%', () => {
        mathRandomSpy.mockReturnValue(MOVEMENT_CONSTANTS.game.fifteenPercent);
        expect(service['hasPlayerTrippedOnIce']()).toBe(false);
    });

    it('should call getReachableTiles with correct parameters and return sample Reachable Tiles', () => {
        const result = service.getReachableTiles(MOCK_ROOM_GAMES.multiplePlayers);
        expect(dijkstraService.dijkstraReachableTilesAlgo).toHaveBeenCalledWith(
            MOCK_ROOM_GAMES.multiplePlayers.players,
            MOCK_ROOM_GAMES.multiplePlayers.game,
        );
        expect(result).toEqual(MOCK_MOVEMENT.reachableTiles);
    });

    it('should call findShortestPath with correct parameters and return a sample expected path', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));
        const destination: Vec2 = { x: 5, y: 5 };
        const result = service['calculateShortestPath'](room, destination);
        expect(dijkstraService.getOptimalPath).toHaveBeenCalledWith(MOCK_MOVEMENT.reachableTiles, destination);
        expect(result).toEqual(MOCK_MOVEMENT.reachableTiles);
    });

    it('should not truncate the desired path if the player has not tripped', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        const isPlayerOnIceSpy = jest.spyOn(PlayerMovementService.prototype as any, 'isPlayerOnIce').mockReturnValue(false);
        const hasPlayerTrippedOnIceSpy = jest.spyOn(PlayerMovementService.prototype as any, 'hasPlayerTrippedOnIce').mockReturnValue(false);

        const result = service.executeShortestPath(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTiles[0].path);
        expect(isPlayerOnIceSpy).toHaveBeenCalledTimes(MOCK_MOVEMENT.reachableTiles[0].path.length);
        expect(result.hasTripped).toBe(false);
        expect(hasPlayerTrippedOnIceSpy).not.toHaveBeenCalled();
    });

    it('should truncate the desired path if the player has tripped', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        const isPlayerOnIceSpy = jest.spyOn(PlayerMovementService.prototype as any, 'isPlayerOnIce').mockImplementation((node: Vec2) => {
            return node.x === 0 && node.y === 2;
        });
        const hasPlayerTrippedOnIceSpy = jest.spyOn(PlayerMovementService.prototype as any, 'hasPlayerTrippedOnIce').mockReturnValue(true);

        const result = service.executeShortestPath(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTilesTruncated.path);
        expect(result.optimalPath.position).toEqual({ x: 0, y: 2 });
        expect(result.hasTripped).toBe(true);
        expect(isPlayerOnIceSpy).toHaveBeenCalled();
        expect(hasPlayerTrippedOnIceSpy).toHaveBeenCalledTimes(1);
    });

    it('should not truncate the desired path if the player is not on an item ', () => {
        const room: RoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        const isPlayerOnItemSpy = jest.spyOn(service as any, 'isPlayerOnItem').mockReturnValue(false);

        const result = service.executeShortestPath(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTiles[0].path);
        expect(isPlayerOnItemSpy).toHaveBeenCalledTimes(MOCK_MOVEMENT.reachableTiles[0].path.length);
    });

    it('should return false if the player is not on an item', () => {
        const room: RoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));
        const node: Vec2 = { x: 1, y: 0 };

        room.game.map.placedItems = [
            { type: ItemType.Start, position: { x: 0, y: 0 } },
            { type: ItemType.BismuthShield, position: { x: 0, y: 2 } },
        ];

        const result = service['isPlayerOnItem'](node, room);
        expect(result).toBe(false);
    });

    it('should return true if the player is on an item', () => {
        const room: RoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const node: Vec2 = { x: 0, y: 2 };

        room.game.map.placedItems = [
            { type: ItemType.Start, position: { x: 0, y: 0 } },
            { type: ItemType.BismuthShield, position: { x: 0, y: 2 } },
        ];

        const result = service['isPlayerOnItem'](node, room);
        expect(result).toBe(true);
    });

    it('should truncate the desired path if the player is on an item', () => {
        const room: RoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        const isPlayerOnItemSpy = jest.spyOn(service as any, 'isPlayerOnItem').mockImplementation((node: Vec2) => {
            return node.x === 0 && node.y === 2;
        });

        const result = service.executeShortestPath(MOCK_MOVEMENT.reachableTiles[0], room);
        expect(result.optimalPath.path).toEqual(MOCK_MOVEMENT.reachableTilesTruncated.path);
        expect(isPlayerOnItemSpy).toHaveBeenCalled();
        expect(result.optimalPath.position).toEqual({ x: 0, y: 2 });
    });

    it('should process a player movement and update the room accordingly', () => {
        const destination: Vec2 = { x: 5, y: 5 };

        const expectedOutput: MovementServiceOutput = {
            optimalPath: MOCK_MOVEMENT.reachableTiles[0],
            hasTripped: false,
            isOnItem: false,
            interactiveObject: null,
        };

        const executeShortestPathSpy = jest.spyOn(service, 'executeShortestPath').mockReturnValue(expectedOutput);
        const result = service.executePlayerMovement(destination, MOCK_ROOM_GAMES.multiplePlayers);

        expect(executeShortestPathSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedOutput);
    });

    describe('setTrueDestination', () => {
        let currentPlayer: Player;
        let destinationTile: ReachableTile;
        let actualPath: PathNode[];

        currentPlayer = {
            playerInGame: {
                currentPosition: { x: 0, y: 0 },
                remainingMovement: 5,
            },
        } as Player;

        destinationTile = {
            path: [],
            remainingMovement: 0,
            position: { x: 0, y: 0 },
        } as ReachableTile;

        actualPath = [] as PathNode[];

        it('should correctly set the remainingMovement from the last PathNode in actualPath', () => {
            service['setTrueDestination'](destinationTile, currentPlayer, actualPath);

            expect(destinationTile.remainingMovement).toBe(5);
            expect(destinationTile.position).toEqual(currentPlayer.playerInGame.currentPosition);
            expect(destinationTile.path).toEqual(actualPath);
        });
    });

    it('should correctly update flags based on player position', () => {
        const movementFlags: MovementFlags = {
            isOnItem: false,
            hasTripped: false,
            isOnClosedDoor: false,
            interactiveObject: null,
        };
        const futurePosition: Vec2 = { x: 1, y: 1 };
        const room: RoomGame = MOCK_ROOM_GAME;

        const isPlayerOnItemSpy = jest.spyOn(service as any, 'isPlayerOnItem').mockReturnValue(true);
        const checkForIceTripSpy = jest.spyOn(service as any, 'checkForIceTrip').mockReturnValue(false);
        const isPlayerOnClosedDoorSpy = jest.spyOn(service as any, 'isPlayerOnClosedDoor').mockReturnValue(false);
        const isBlockedByObstacleSpy = jest.spyOn(service as any, 'isBlockedByObstacle').mockReturnValue(true);

        service['updateFlags'](movementFlags, futurePosition, room);

        expect(movementFlags.isOnItem).toBe(true);
        expect(movementFlags.hasTripped).toBe(false);
        expect(movementFlags.isOnClosedDoor).toBe(false);

        expect(isPlayerOnItemSpy).toHaveBeenCalledWith(futurePosition, room);
        expect(checkForIceTripSpy).toHaveBeenCalledWith(futurePosition, room);
        expect(isPlayerOnClosedDoorSpy).toHaveBeenCalledWith(futurePosition, room);
        expect(isBlockedByObstacleSpy).toHaveBeenCalledWith(movementFlags, futurePosition, room);
    });
});
