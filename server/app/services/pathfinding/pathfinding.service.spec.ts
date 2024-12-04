/* eslint-disable */
import { MOCK_ROOM_ITEMS, MOCK_ROOM_OFFENSIVE_DEFENSIVE_ITEMS } from '@app/constants/item-test.constants';
import { MOCK_ROOM_GAMES, MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { MOCK_PLAYERS, MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { VirtualPlayerState } from '@app/interfaces/ai-state';
import { RoomGame } from '@app/interfaces/room-game';
import { ConditionalItemService } from '@app/services/item/conditional-item/conditional-item.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import * as utils from '@app/utils/utilities';
import { isValidTerrainForItem } from '@app/utils/utilities';
import { DEFENSIVE_ITEMS, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { Direction } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import * as sinon from 'sinon';
import { createStubInstance } from 'sinon';
import { VirtualPlayerStateService } from '../virtual-player-state/virtual-player-state.service';
import { PathFindingService } from './pathfinding.service';

describe('PathFindingService', () => {
    let service: PathFindingService;
    let roomManagerService: sinon.SinonStubbedInstance<RoomManagerService>;
    let virtualPlayerStateService: sinon.SinonStubbedInstance<VirtualPlayerStateService>;
    beforeEach(async () => {
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        virtualPlayerStateService = createStubInstance<VirtualPlayerStateService>(VirtualPlayerStateService);
        virtualPlayerStateService.getVirtualState.returns({ isSeekingPlayers: false } as VirtualPlayerState);
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
                { provide: VirtualPlayerStateService, useValue: virtualPlayerStateService },
            ],
        }).compile();

        service = module.get<PathFindingService>(PathFindingService);
    });

    it('should return a blank array when the player is trapped', () => {
        const newPosition: Vec2 = { x: 2, y: 1 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.trapped.players, MOCK_ROOM_GAMES.trapped.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile with a closed Door', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.trapped.players, MOCK_ROOM_GAMES.trapped.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile with a wall', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.corridor.players, MOCK_ROOM_GAMES.corridor.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return the sole valid path when the player wants to move through a corridor', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.corridor.players, MOCK_ROOM_GAMES.corridor.game);
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

    it('should return the start position when no other player is on the tile', () => {
        const player: Player = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const room: RoomGame = MOCK_ROOM_GAME;
        jest.spyOn(utils, 'isPlayerOtherThanCurrentDefenderPresentOnTile').mockReturnValue(false);
        const result: Vec2 = service.getReSpawnPosition(player, room);
        expect(result).toEqual(player.playerInGame.startPosition);
    });

    it('should return the nearest valid position when another player is on the start tile', () => {
        const player: Player = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const room: RoomGame = {
            ...MOCK_ROOM_GAME,
            players: [
                ...MOCK_ROOM_GAME.players,
                { playerInGame: { startPosition: player.playerInGame.startPosition }, playerInfo: { userName: 'otherPlayer' } } as Player,
            ],
        };

        jest.spyOn(utils, 'isPlayerOtherThanCurrentDefenderPresentOnTile').mockReturnValue(true);
        const findNearestValidPositionSpy = jest.spyOn(service, 'findNearestValidPosition').mockReturnValue({ x: 1, y: 1 });

        const result: Vec2 = service.getReSpawnPosition(player, room);

        expect(findNearestValidPositionSpy).toHaveBeenCalledWith(room, player.playerInGame.startPosition, false);
        expect(result).toEqual({ x: 1, y: 1 });
    });

    it('should return the position of the entity if the position matches', () => {
        const pos: Vec2 = { x: 1, y: 1 };
        const entities = [{ position: { x: 0, y: 0 } }, { position: { x: 1, y: 1 } }, { position: { x: 2, y: 2 } }];

        const positionExtractor = (entity: any) => entity.position;

        const result = service['checkForNearestEntity'](pos, entities, positionExtractor);
        expect(result).toEqual({ x: 1, y: 1 });
    });

    it('should return null if no entity matches the position', () => {
        const pos: Vec2 = { x: 1, y: 1 };
        const entities = [{ position: { x: 0, y: 0 } }, { position: { x: 2, y: 2 } }];

        const positionExtractor = (entity: any) => entity.position;

        const result = service['checkForNearestEntity'](pos, entities, positionExtractor);
        expect(result).toBeNull();
    });

    it('should return the sole valid path when the player wants to move through a corridor with an open door', () => {
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.untrapped.players, MOCK_ROOM_GAMES.untrapped.game);
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
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.zigzag.players, MOCK_ROOM_GAMES.zigzag.game);
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
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value', () => {
        const newPosition: Vec2 = { x: 4, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return the only possible path when the player wants to move to the furthest away tile', () => {
        const newPosition: Vec2 = { x: 2, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
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
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (negative value)', () => {
        const newPosition: Vec2 = { x: MOVEMENT_CONSTANTS.coords.invalidNegative, y: MOVEMENT_CONSTANTS.coords.invalidNegative };
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value on a water map', () => {
        const newPosition: Vec2 = { x: 4, y: 3 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(
            MOCK_ROOM_GAMES.multiplePlayersWater.players,
            MOCK_ROOM_GAMES.multiplePlayersWater.game,
        );
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return the only possible path when the player wants to move to the furthest away tile on a water map', () => {
        const newPosition: Vec2 = { x: 0, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(
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
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.weird.players, MOCK_ROOM_GAMES.weird.game);
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

    it('should not let the current player move through player 2', () => {
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.weird.players, MOCK_ROOM_GAMES.weird.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return an empty path if the player chooses their current position as a destination', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesAlgo(MOCK_ROOM_GAMES.weird.players, MOCK_ROOM_GAMES.weird.game);

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
        const reachableTiles = service.dijkstraReachableTilesAlgo(mockRoom.players, mockRoom.game);
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
        const reachableTiles = service.dijkstraReachableTilesAlgo(mockRoom.players, mockRoom.game);
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
        it('should not return the start position', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
            const startPosition: Vec2 = { x: 1, y: 0 };

            const result = service.findNearestValidPosition(room, startPosition, false);

            expect(result).not.toEqual(startPosition);
        });

        it('should not return position with another player', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[1]);
            const startPosition: Vec2 = { x: 1, y: 1 };

            const result = service.findNearestValidPosition(room, startPosition, false);

            expect(result).not.toEqual(startPosition);
        });
    });

    describe('when checking for item placement (checkForItems: true)', () => {
        it('should return valid position for item placement', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
            room.players[0].playerInGame.currentPosition = { x: 0, y: 0 };
            const startPosition: Vec2 = { x: 0, y: 0 };

            const result = service.findNearestValidPosition(room, startPosition, true);

            expect(result).toBeTruthy();
            expect(isValidTerrainForItem(result, room.game.map.mapArray)).toBe(true);
        });

        it('should not return the start position if it is invalid', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
            const startPosition: Vec2 = { x: 2, y: 1 };

            const result = service.findNearestValidPosition(room, startPosition, true);

            expect(result).not.toEqual(startPosition);
        });

        it('should not return position with existing item', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
            room.players[0].playerInGame.currentPosition = { x: 1, y: 0 };
            const itemPosition: Vec2 = { x: 1, y: 0 };
            const existingItemPosition: Vec2 = { x: 1, y: 1 };
            const result = service.findNearestValidPosition(room, itemPosition, true);

            expect(result).not.toEqual(existingItemPosition);
        });

        it('should not return position with existing player', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
            room.players[0].playerInGame.currentPosition = { x: 1, y: 0 };
            const itemPosition: Vec2 = { x: 1, y: 0 };
            const playerPosition: Vec2 = { x: 2, y: 0 };

            const result = service.findNearestValidPosition(room, itemPosition, true);

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
                virtualPlayerStateService.getVirtualState.returns({ isSeekingPlayers: true } as VirtualPlayerState);
                roomManagerService.getCurrentRoomPlayer.returns(room.players[0]);
                room.players[0].playerInGame.currentPosition = { x: 0, y: 0 };
                const startPosition: Vec2 = { x: 0, y: 0 };
                const nearestSpy = jest.spyOn(PathFindingService.prototype as any, 'findNearestObject');
                service.getNearestPlayerPosition(room, startPosition);
                expect(nearestSpy).toHaveBeenCalled();
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
