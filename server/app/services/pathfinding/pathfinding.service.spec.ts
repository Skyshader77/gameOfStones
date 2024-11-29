/* eslint-disable */
import { MOCK_ROOM_ITEMS, MOCK_ROOM_OFFENSIVE_DEFENSIVE_ITEMS } from '@app/constants/item-test.constants';
import { MOCK_ROOM_GAMES, MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { ConditionalItemService } from '@app/services/conditional-item/conditional-item.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { isValidTerrainForItem } from '@app/utils/utilities';
import { DEFENSIVE_ITEMS, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { Direction } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import * as sinon from 'sinon';
import { createStubInstance } from 'sinon';
import { PathFindingService } from './pathfinding.service';

describe('PathFindingService', () => {
    let service: PathFindingService;
    let roomManagerService: sinon.SinonStubbedInstance<RoomManagerService>;
    beforeEach(async () => {
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PathFindingService,
                {
                    provide: ConditionalItemService,
                    useValue: {
                        areSapphireFinsApplied: jest.fn().mockReturnValue(false),
                    },
                },
                { provide: RoomManagerService, useValue: roomManagerService },
            ],
        }).compile();

        service = module.get<PathFindingService>(PathFindingService);
    });

    it('should return a blank array when the player is trapped', () => {
        const newPosition: Vec2 = { x: 2, y: 1 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.trapped.players, MOCK_ROOM_GAMES.trapped.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile with a closed Door', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.trapped.players, MOCK_ROOM_GAMES.trapped.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should not return a blank array when the AI player wants to move to a tile with a closed Door', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesAi(MOCK_ROOM_GAMES.trapped.players, MOCK_ROOM_GAMES.trapped.game, false);
        expect(service.getOptimalPath(reachableTiles, newPosition)).not.toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile with a wall', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.corridor.players, MOCK_ROOM_GAMES.corridor.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return the sole valid path when the player wants to move through a corridor', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.corridor.players, MOCK_ROOM_GAMES.corridor.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 6 },
                { direction: Direction.DOWN, remainingMovement: 6 },
            ],
            remainingMovement: currentPlayer.playerInGame.remainingMovement,
            cost: 0,
        });
    });

    it('should return the sole valid path when the player wants to move through a corridor with an open door', () => {
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.untrapped.players, MOCK_ROOM_GAMES.untrapped.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 5 },
                { direction: Direction.DOWN, remainingMovement: 5 },
            ],
            remainingMovement: 5,
            cost: 1,
        });
    });

    it('should return the minimum valid path when the player wants to move through a corridor surrounded by water', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.zigzag.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.zigzag.players, MOCK_ROOM_GAMES.zigzag.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 6 },
                { direction: Direction.LEFT, remainingMovement: 6 },
                { direction: Direction.DOWN, remainingMovement: 6 },
                { direction: Direction.LEFT, remainingMovement: 6 },
            ],
            remainingMovement: currentPlayer.playerInGame.remainingMovement,
            cost: 0,
        });
    });

    it('should return a blank array when the player wants to move to a tile with a player on it', () => {
        const newPosition: Vec2 = { x: 1, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value', () => {
        const newPosition: Vec2 = { x: 4, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return the only possible path when the player wants to move to the furthest away tile', () => {
        const newPosition: Vec2 = { x: 2, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 5 },
                { direction: Direction.DOWN, remainingMovement: 4 },
                { direction: Direction.RIGHT, remainingMovement: 3 },
                { direction: Direction.RIGHT, remainingMovement: 2 },
                { direction: Direction.UP, remainingMovement: 1 },
                { direction: Direction.UP, remainingMovement: 0 },
            ],
            remainingMovement: 0,
            cost: 6,
        });
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (positive value)', () => {
        const newPosition: Vec2 = { x: MOVEMENT_CONSTANTS.coords.invalidPositive, y: MOVEMENT_CONSTANTS.coords.invalidPositive };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (negative value)', () => {
        const newPosition: Vec2 = { x: MOVEMENT_CONSTANTS.coords.invalidNegative, y: MOVEMENT_CONSTANTS.coords.invalidNegative };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value on a water map', () => {
        const newPosition: Vec2 = { x: 4, y: 3 };
        const reachableTiles = service.dijkstraReachableTilesHuman(
            MOCK_ROOM_GAMES.multiplePlayersWater.players,
            MOCK_ROOM_GAMES.multiplePlayersWater.game,
        );
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should not return an array when the AI player wants to move to a tile exceeding the player maximum displacement value on a water map', () => {
        const newPosition: Vec2 = { x: 4, y: 3 };
        const reachableTiles = service.dijkstraReachableTilesAi(
            MOCK_ROOM_GAMES.multiplePlayersWater.players,
            MOCK_ROOM_GAMES.multiplePlayersWater.game,
            false,
        );
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            path: [
                { direction: Direction.DOWN, remainingMovement: 998 },
                { direction: Direction.DOWN, remainingMovement: 996 },
                { direction: Direction.DOWN, remainingMovement: 994 },
                { direction: Direction.RIGHT, remainingMovement: 992 },
                { direction: Direction.RIGHT, remainingMovement: 990 },
                { direction: Direction.RIGHT, remainingMovement: 988 },
                { direction: Direction.RIGHT, remainingMovement: 986 },
            ],
            position: { x: 4, y: 3 },
            remainingMovement: 986,
            cost: 14,
        });
    });

    it('should return the only possible path when the player wants to move to the furthest away tile on a water map', () => {
        const newPosition: Vec2 = { x: 0, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesHuman(
            MOCK_ROOM_GAMES.multiplePlayersWater.players,
            MOCK_ROOM_GAMES.multiplePlayersWater.game,
        );
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 4 },
                { direction: Direction.DOWN, remainingMovement: 2 },
            ],
            remainingMovement: 2,
            cost: 4,
        });
    });

    it('should return the only possible path when the player wants to move next to the right of player 2', () => {
        const newPosition: Vec2 = { x: 3, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.weird.players, MOCK_ROOM_GAMES.weird.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.RIGHT, remainingMovement: 4 },
                { direction: Direction.RIGHT, remainingMovement: 4 },
                { direction: Direction.DOWN, remainingMovement: 3 },
                { direction: Direction.DOWN, remainingMovement: 2 },
            ],
            remainingMovement: 2,
            cost: 4,
        });
    });

    it('should return the only possible path when the AI player wants to the position of player 2', () => {
        const newPosition: Vec2 = { x: 2, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesAi(MOCK_ROOM_GAMES.weird.players, MOCK_ROOM_GAMES.weird.game, true);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 999 },
                { direction: Direction.DOWN, remainingMovement: 999 },
                { direction: Direction.RIGHT, remainingMovement: 997 },
            ],
            remainingMovement: 997,
            cost: 3,
        });
    });

    it('should not let the current player move through player 2', () => {
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.weird.players, MOCK_ROOM_GAMES.weird.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return an empty path if the player chooses their current position as a destination', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesHuman(MOCK_ROOM_GAMES.weird.players, MOCK_ROOM_GAMES.weird.game);

        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            path: [],
            remainingMovement: currentPlayer.playerInGame.remainingMovement,
            cost: 0,
        });
    });

    it('should return the only possible path when player 3 wants to move next to their closed door', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird.players[2])) as Player;
        mockRoom.game.currentPlayer = currentPlayer.playerInfo.userName;
        const newPosition: Vec2 = { x: 3, y: 4 };
        const reachableTiles = service.dijkstraReachableTilesHuman(mockRoom.players, mockRoom.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 5 },
                { direction: Direction.LEFT, remainingMovement: 3 },
            ],
            remainingMovement: 3,
            cost: 3,
        });
    });

    it('should allow player 2 to move to the left-most corner', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird.players[1])) as Player;
        mockRoom.game.currentPlayer = currentPlayer.playerInfo.userName;
        const newPosition: Vec2 = { x: 4, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesHuman(mockRoom.players, mockRoom.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.RIGHT, remainingMovement: 5 },
                { direction: Direction.UP, remainingMovement: 4 },
                { direction: Direction.UP, remainingMovement: 4 },
                { direction: Direction.RIGHT, remainingMovement: 3 },
            ],
            remainingMovement: 3,
            cost: 3,
        });
    });

    describe('when checking for free tiles (checkForItems: false)', () => {
        it('should not return the start position if it is invalid', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
            const startPosition: Vec2 = { x: 0, y: 0 };

            const result = service.findNearestValidPosition({
                room,
                startPosition,
                checkForItems: false,
            });

            expect(result).not.toEqual(startPosition);
        });

        it('should not return position with another player', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[1]);
            const startPosition: Vec2 = { x: 1, y: 1 };

            const result = service.findNearestValidPosition({
                room,
                startPosition,
                checkForItems: false,
            });

            expect(result).not.toEqual(startPosition);
        });
    });

    describe('when checking for item placement (checkForItems: true)', () => {
        it('should return valid position for item placement', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
            room.players[0].playerInGame.currentPosition = { x: 0, y: 0 };
            const startPosition: Vec2 = { x: 0, y: 0 };

            const result = service.findNearestValidPosition({
                room,
                startPosition,
                checkForItems: true,
            });

            expect(result).toBeTruthy();
            expect(isValidTerrainForItem(result, room.game.map.mapArray)).toBe(true);
        });

        it('should not return the start position if it is invalid', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
            const startPosition: Vec2 = { x: 2, y: 1 };

            const result = service.findNearestValidPosition({
                room,
                startPosition,
                checkForItems: true,
            });

            expect(result).not.toEqual(startPosition);
        });

        it('should not return position with existing item', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
            room.players[0].playerInGame.currentPosition = { x: 1, y: 0 };
            const itemPosition: Vec2 = { x: 1, y: 0 };
            const existingItemPosition: Vec2 = { x: 1, y: 1 };
            const result = service.findNearestValidPosition({
                room,
                startPosition: itemPosition,
                checkForItems: true,
            });

            expect(result).not.toEqual(existingItemPosition);
        });

        it('should not return position with existing player', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
            room.players[0].playerInGame.currentPosition = { x: 1, y: 0 };
            const itemPosition: Vec2 = { x: 1, y: 0 };
            const playerPosition: Vec2 = { x: 2, y: 0 };

            const result = service.findNearestValidPosition({
                room,
                startPosition: itemPosition,
                checkForItems: true,
            });

            expect(result).not.toEqual(playerPosition);
        });
    });

    describe('findNearestValidPosition', () => {
        describe('findNearestItemPosition', () => {
            it('should return the closest Item to the current player', () => {
                const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
                const startPosition: Vec2 = { x: 0, y: 0 };
                roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
                room.players[0].playerInGame.currentPosition = { x: 0, y: 0 };
                const result = service.getNearestItemPosition(room, startPosition);
                expect(result).toEqual({ cost: 2, position: { x: 1, y: 1 } });
            });
        });

        describe('findNearestPlayerPosition', () => {
            it('should return the closest player to the current player', () => {
                const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
                roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
                room.players[0].playerInGame.currentPosition = { x: 0, y: 0 };
                const startPosition: Vec2 = { x: 0, y: 0 };
                const result = service.getNearestPlayerPosition(room, startPosition);
                expect(result).toEqual({ cost: 2, position: { x: 2, y: 0 } });
            });
        });

        describe('findNearestOffensiveItem', () => {
            it('should return the closest Offensive item to the current player', () => {
                const room = JSON.parse(JSON.stringify(MOCK_ROOM_OFFENSIVE_DEFENSIVE_ITEMS)) as RoomGame;
                roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
                room.players[0].playerInGame.currentPosition = { x: 0, y: 0 };
                const startPosition: Vec2 = { x: 0, y: 0 };
                const result = service.getNearestItemPosition(room, startPosition, OFFENSIVE_ITEMS);
                expect(result).toEqual({ cost: 2, position: { x: 1, y: 1 } });
            });
        });

        describe('findNearestDefensiveItem', () => {
            it('should return the closest Defensive item to the current player', () => {
                const room = JSON.parse(JSON.stringify(MOCK_ROOM_OFFENSIVE_DEFENSIVE_ITEMS)) as RoomGame;
                roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
                room.players[0].playerInGame.currentPosition = { x: 0, y: 0 };
                const startPosition: Vec2 = { x: 0, y: 0 };
                const result = service.getNearestItemPosition(room, startPosition, DEFENSIVE_ITEMS);
                expect(result.position).toEqual({ x: 2, y: 2 });
                const EXPECTED_RESULT_COST = 4;
                expect(result.cost).toEqual(EXPECTED_RESULT_COST);
            });
        });
    });
});
