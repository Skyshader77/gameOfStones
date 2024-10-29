import { FIFTEEN_PERCENT, MOCK_ROOM_GAME_CORRIDOR, MOCK_ROOM_MULTIPLE_PLAYERS, NINE_PERCENT } from '@app/constants/player.movement.test.constants';
import { MOCK_ROOM } from '@app/constants/test.constants';
import { DijkstraService } from '@app/services/dijkstra/dijkstra.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerMovementService } from './player-movement.service';

describe('PlayerMovementService', () => {
    let service: PlayerMovementService;
    let mathRandomSpy: jest.SpyInstance;
    let dijsktraService: DijkstraService;
    let roomManagerService: RoomManagerService;
    let isPlayerOnIceSpy: jest.SpyInstance;
    let hasPlayerTrippedOnIceSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayerMovementService,
                {
                    provide: DijkstraService,
                    useValue: {
                        findShortestPath: jest.fn(),
                    },
                },
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
        dijsktraService = module.get<DijkstraService>(DijkstraService);
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

    it('should not update the position if player ID is not found', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        const newPosition: Vec2 = { x: 2, y: 2 };
        const INVALID_ID = 'Othmane';
        service.updatePlayerPosition(newPosition, INVALID_ID, room, 0);

        expect(room.players[0].playerInGame.currentPosition).toEqual({ x: 0, y: 0 });
        expect(room.players[1].playerInGame.currentPosition).toEqual({ x: 0, y: 1 });
    });

    it('should call findShortestPath with correct parameters and return a sample expected path', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        const currentPlayer = room.players[0];
        const destination: Vec2 = { x: 5, y: 5 };
        const expectedPath: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 5 },
        ];

        const MOCK_REACHABLE_TILE = { position: destination, displacementVector: expectedPath, remainingPlayerSpeed: 0 };

        jest.spyOn(dijsktraService, 'findShortestPath').mockReturnValue(MOCK_REACHABLE_TILE);
        const result = service.calculateShortestPath(destination, room, currentPlayer);
        expect(result).toEqual(MOCK_REACHABLE_TILE);
    });

    it('should not truncate the desired path if the player has not tripped', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        const destination: Vec2 = { x: 5, y: 5 };
        const desiredPath: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 5 },
        ];

        const MOCK_REACHABLE_TILE = { position: destination, displacementVector: desiredPath, remainingPlayerSpeed: 0 };

        isPlayerOnIceSpy = jest.spyOn(service, 'isPlayerOnIce').mockReturnValue(false);
        hasPlayerTrippedOnIceSpy = jest.spyOn(service, 'hasPlayerTrippedOnIce').mockReturnValue(false);

        const result = service.executeShortestPath(MOCK_REACHABLE_TILE, room);
        expect(result.dijkstraServiceOutput.displacementVector).toEqual(desiredPath);
        expect(isPlayerOnIceSpy).toHaveBeenCalledTimes(desiredPath.length);
        expect(result.hasTripped).toBe(false);
        expect(hasPlayerTrippedOnIceSpy).not.toHaveBeenCalled();
    });

    it('should truncate the desired path if the player has tripped', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        const destination: Vec2 = { x: 5, y: 5 };
        const desiredPath: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 5 },
        ];

        const MOCK_REACHABLE_TILE = { position: destination, displacementVector: desiredPath, remainingPlayerSpeed: 0 };

        isPlayerOnIceSpy = jest.spyOn(service, 'isPlayerOnIce').mockImplementation((node: Vec2) => {
            return node.x === 1 && node.y === 1;
        });
        hasPlayerTrippedOnIceSpy = jest.spyOn(service, 'hasPlayerTrippedOnIce').mockReturnValue(true);

        const result = service.executeShortestPath(MOCK_REACHABLE_TILE, room);
        expect(result.dijkstraServiceOutput.displacementVector).toEqual([
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ]);
        expect(result.dijkstraServiceOutput.position).toEqual({ x: 1, y: 1 });
        expect(result.hasTripped).toBe(true);
        expect(hasPlayerTrippedOnIceSpy).toHaveBeenCalledTimes(1);
    });

    it('should process a player movement and update the room accordingly', () => {
        const destination: Vec2 = { x: 5, y: 5 };
        const desiredPath: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 5 },
        ];

        const MOCK_REACHABLE_TILE = { position: destination, displacementVector: desiredPath, remainingPlayerSpeed: 0 };
        const expectedOutput = {
            dijkstraServiceOutput: MOCK_REACHABLE_TILE,
            hasTripped: false,
        };

        const calculateShortestPathSpy = jest.spyOn(service, 'calculateShortestPath').mockReturnValue(MOCK_REACHABLE_TILE);

        const executeShortestPathSpy = jest.spyOn(service, 'executeShortestPath').mockReturnValue(expectedOutput);
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_MULTIPLE_PLAYERS);
        const setRoomSpy = jest.spyOn(roomManagerService, 'updateRoom');
        const result = service.processPlayerMovement(destination, MOCK_ROOM.roomCode, '1');

        expect(calculateShortestPathSpy).toHaveBeenCalledTimes(1);
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM.roomCode);
        expect(executeShortestPathSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedOutput);
        expect(setRoomSpy).toHaveBeenCalledTimes(1);
    });
});

// import {
//     INVALID_NEGATIVE_COORDINATE,
//     INVALID_POSITIVE_COORDINATE,
//     MOCK_ROOM_GAME_CORRIDOR,
//     MOCK_ROOM_GAME_TRAPPED,
//     MOCK_ROOM_MULTIPLE_PLAYERS,
//     MOCK_ROOM_MULTIPLE_PLAYERS_WATER,
//     MOCK_ROOM_UNTRAPPED,
//     MOCK_ROOM_WEIRD_GAME,
//     MOCK_ROOM_ZIG_ZAG,
// } from '@app/constants/player.movement.test.constants';
// import { Vec2 } from '@common/interfaces/vec2';
// import { Test, TestingModule } from '@nestjs/testing';
// import { DijkstraService } from './dijkstra.service';
// import { Player } from '@app/interfaces/player';
// import { RoomGame } from '@app/interfaces/room-game';

// describe('DijkstraService', () => {
//     let service: DijkstraService;
//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [DijkstraService],
//         }).compile();
//         service = module.get<DijkstraService>(DijkstraService);
//     });
//     it('should return true when another player is at  x=1 and y=1', () => {
//         const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
//         const newPosition: Vec2 = { x: 0, y: 1 };
//         expect(service.isAnotherPlayerPresentOnTile(newPosition, room)).toEqual(true);
//     });
//     it('should return false when current player is at  x=0 and y=0', () => {
//         const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
//         const newPosition: Vec2 = { x: 0, y: 0 };
//         expect(service.isAnotherPlayerPresentOnTile(newPosition, room)).toEqual(false);
//     });

//     it('should return false when no one is at  x=2 and y=2', () => {
//         const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
//         const newPosition: Vec2 = { x: 2, y: 2 };
//         expect(service.isAnotherPlayerPresentOnTile(newPosition, room)).toEqual(false);
//     });

//     it('should return a blank array when the player is trapped', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED.players[0])) as Player;
//         const newPosition: Vec2 = { x: 1, y: 2 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return a blank array when the player wants to move to a tile with a closed Door', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED.players[0])) as Player;
//         const newPosition: Vec2 = { x: 0, y: 0 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return a blank array when the player wants to move to a tile with a wall', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR.players[0])) as Player;
//         const newPosition: Vec2 = { x: 0, y: 0 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return the sole valid path when the player wants to move through a corridor', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR.players[0])) as Player;
//         const newPosition: Vec2 = { x: 2, y: 1 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: newPosition,
//             displacementVector: [
//                 { x: 0, y: 1 },
//                 { x: 1, y: 1 },
//                 { x: 2, y: 1 },
//             ],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return the sole valid path when the player wants to move through a corridor with an open door', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_UNTRAPPED)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_UNTRAPPED.players[0])) as Player;
//         const newPosition: Vec2 = { x: 2, y: 1 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: newPosition,
//             displacementVector: [
//                 { x: 0, y: 1 },
//                 { x: 1, y: 1 },
//                 { x: 2, y: 1 },
//             ],
//             remainingPlayerSpeed: 4,
//         });
//     });

//     it('should return the minimum valid path when the player wants to move through a corridor surrounded by water', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ZIG_ZAG)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_ZIG_ZAG.players[0])) as Player;
//         const newPosition: Vec2 = { x: 2, y: 0 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: newPosition,
//             displacementVector: [
//                 { x: 0, y: 2 },
//                 { x: 1, y: 2 },
//                 { x: 1, y: 1 },
//                 { x: 2, y: 1 },
//                 { x: 2, y: 0 },
//             ],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return a blank array when the player wants to move to a tile with a player on it', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
//         const newPosition: Vec2 = { x: 0, y: 1 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
//         const newPosition: Vec2 = { x: 0, y: 2 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return the only possible path when the player wants to move to the furthest away tile', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
//         const newPosition: Vec2 = { x: 1, y: 2 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: newPosition,
//             displacementVector: [
//                 { x: 0, y: 0 },
//                 { x: 1, y: 0 },
//                 { x: 2, y: 0 },
//                 { x: 2, y: 1 },
//                 { x: 2, y: 2 },
//                 { x: 1, y: 2 },
//             ],
//             remainingPlayerSpeed: 0,
//         });
//     });

//     it('should return a blank array when the player wants to move to a tile beyond the map size (positive value)', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
//         const newPosition: Vec2 = { x: INVALID_POSITIVE_COORDINATE, y: INVALID_POSITIVE_COORDINATE };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return a blank array when the player wants to move to a tile beyond the map size (negative value)', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
//         const newPosition: Vec2 = { x: INVALID_NEGATIVE_COORDINATE, y: INVALID_NEGATIVE_COORDINATE };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value on a water map', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER.players[0])) as Player;
//         const newPosition: Vec2 = { x: 2, y: 1 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return the only possible path when the player wants to move to the furthest away tile on a water map', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER.players[0])) as Player;
//         const newPosition: Vec2 = { x: 2, y: 0 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: newPosition,
//             displacementVector: [
//                 { x: 0, y: 0 },
//                 { x: 1, y: 0 },
//                 { x: 2, y: 0 },
//             ],
//             remainingPlayerSpeed: 1,
//         });
//     });

//     it('should return the only possible path when the player wants to move next to the right of player 2', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[0])) as Player;
//         const newPosition: Vec2 = { x: 2, y: 3 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: newPosition,
//             displacementVector: [
//                 { x: 0, y: 1 },
//                 { x: 0, y: 2 },
//                 { x: 0, y: 3 },
//                 { x: 1, y: 3 },
//                 { x: 2, y: 3 },
//             ],
//             remainingPlayerSpeed: 1,
//         });
//     });

//     it('should not let the current player move through player 2', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[0])) as Player;
//         const newPosition: Vec2 = { x: 2, y: 1 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return an empty array if the player chooses their current position as a destination', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[0])) as Player;
//         const newPosition: Vec2 = { x: 0, y: 1 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });

//     it('should return the only possible path when player 3 wants to move next to their closed door', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[2])) as Player;
//         const newPosition: Vec2 = { x: 4, y: 3 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
//             position: newPosition,
//             displacementVector: [
//                 { x: 3, y: 4 },
//                 { x: 4, y: 4 },
//                 { x: 4, y: 3 },
//             ],
//             remainingPlayerSpeed: 2,
//         });
//     });

//     it('should allow player 2 to move to the left-most corner', () => {
//         const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
//         const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[1])) as Player;
//         const newPosition: Vec2 = { x: 0, y: 4 };
//         expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).not.toEqual({
//             position: currentPlayer.playerInGame.currentPosition,
//             displacementVector: [],
//             remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
//         });
//     });
// });