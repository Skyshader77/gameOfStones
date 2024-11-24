import { MOCK_ROOM_GAMES, MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { ConditionalItemService } from '@app/services/conditional-item/conditional-item.service';
import { Direction } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { PathfindingService } from './dijkstra.service';
describe('DijkstraService', () => {
    let service: PathfindingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PathfindingService,
                {
                    provide: ConditionalItemService,
                    useValue: {
                        areSapphireFinsApplied: jest.fn().mockReturnValue(false),
                    },
                },
            ],
        }).compile();

        service = module.get<PathfindingService>(PathfindingService);
    });

    it('should return a blank array when the player is trapped', () => {
        const newPosition: Vec2 = { x: 2, y: 1 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.trapped.players, MOCK_ROOM_GAMES.trapped.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile with a closed Door', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.trapped.players, MOCK_ROOM_GAMES.trapped.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should not return a blank array when the AI player wants to move to a tile with a closed Door', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles = service.dijkstraReachableTilesAi(MOCK_ROOM_GAMES.trapped.players, MOCK_ROOM_GAMES.trapped.game, false);
        expect(service.getOptimalPath(reachableTiles, newPosition)).not.toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile with a wall', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.corridor.players, MOCK_ROOM_GAMES.corridor.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return the sole valid path when the player wants to move through a corridor', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.corridor.players, MOCK_ROOM_GAMES.corridor.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 6 },
                { direction: Direction.DOWN, remainingMovement: 6 },
            ],
            remainingMovement: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the sole valid path when the player wants to move through a corridor with an open door', () => {
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.untrapped.players, MOCK_ROOM_GAMES.untrapped.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 5 },
                { direction: Direction.DOWN, remainingMovement: 5 },
            ],
            remainingMovement: 5,
        });
    });

    it('should return the minimum valid path when the player wants to move through a corridor surrounded by water', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.zigzag.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.zigzag.players, MOCK_ROOM_GAMES.zigzag.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 6 },
                { direction: Direction.LEFT, remainingMovement: 6 },
                { direction: Direction.DOWN, remainingMovement: 6 },
                { direction: Direction.LEFT, remainingMovement: 6 },
            ],
            remainingMovement: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return a blank array when the player wants to move to a tile with a player on it', () => {
        const newPosition: Vec2 = { x: 1, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value', () => {
        const newPosition: Vec2 = { x: 4, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return the only possible path when the player wants to move to the furthest away tile', () => {
        const newPosition: Vec2 = { x: 2, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
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
        });
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (positive value)', () => {
        const newPosition: Vec2 = { x: MOVEMENT_CONSTANTS.coords.invalidPositive, y: MOVEMENT_CONSTANTS.coords.invalidPositive };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (negative value)', () => {
        const newPosition: Vec2 = { x: MOVEMENT_CONSTANTS.coords.invalidNegative, y: MOVEMENT_CONSTANTS.coords.invalidNegative };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.multiplePlayers.players, MOCK_ROOM_GAMES.multiplePlayers.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value on a water map', () => {
        const newPosition: Vec2 = { x: 4, y: 3 };
        const reachableTiles = service.dijkstraReachableTiles(
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
        });
    });

    it('should return the only possible path when the player wants to move to the furthest away tile on a water map', () => {
        const newPosition: Vec2 = { x: 0, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(
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
        });
    });

    it('should return the only possible path when the player wants to move next to the right of player 2', () => {
        const newPosition: Vec2 = { x: 3, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.weird.players, MOCK_ROOM_GAMES.weird.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.RIGHT, remainingMovement: 4 },
                { direction: Direction.RIGHT, remainingMovement: 4 },
                { direction: Direction.DOWN, remainingMovement: 3 },
                { direction: Direction.DOWN, remainingMovement: 2 },
            ],
            remainingMovement: 2,
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
        });
    });

    it('should not let the current player move through player 2', () => {
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.weird.players, MOCK_ROOM_GAMES.weird.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return an empty path if the player chooses their current position as a destination', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAMES.weird.players, MOCK_ROOM_GAMES.weird.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            path: [],
            remainingMovement: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the only possible path when player 3 wants to move next to their closed door', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird.players[2])) as Player;
        mockRoom.game.currentPlayer = currentPlayer.playerInfo.userName;
        const newPosition: Vec2 = { x: 3, y: 4 };
        const reachableTiles = service.dijkstraReachableTiles(mockRoom.players, mockRoom.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.DOWN, remainingMovement: 5 },
                { direction: Direction.LEFT, remainingMovement: 3 },
            ],
            remainingMovement: 3,
        });
    });

    it('should allow player 2 to move to the left-most corner', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.weird.players[1])) as Player;
        mockRoom.game.currentPlayer = currentPlayer.playerInfo.userName;
        const newPosition: Vec2 = { x: 4, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(mockRoom.players, mockRoom.game);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: [
                { direction: Direction.RIGHT, remainingMovement: 5 },
                { direction: Direction.UP, remainingMovement: 4 },
                { direction: Direction.UP, remainingMovement: 4 },
                { direction: Direction.RIGHT, remainingMovement: 3 },
            ],
            remainingMovement: 3,
        });
    });
});
