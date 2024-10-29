import {
    INVALID_NEGATIVE_COORDINATE,
    INVALID_POSITIVE_COORDINATE,
    MOCK_ROOM_GAME_CORRIDOR,
    MOCK_ROOM_GAME_TRAPPED,
    MOCK_ROOM_MULTIPLE_PLAYERS,
    MOCK_ROOM_MULTIPLE_PLAYERS_WATER,
    MOCK_ROOM_UNTRAPPED,
    MOCK_ROOM_WEIRD_GAME,
    MOCK_ROOM_ZIG_ZAG,
} from '@app/constants/player.movement.test.constants';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Vec2 } from '@common/interfaces/vec2';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { PathfindingService } from './dijkstra.service';
describe('DijkstraService', () => {
    let service: PathfindingService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PathfindingService],
        }).compile();

        service = module.get<PathfindingService>(PathfindingService);
    });
    it('should return true when another player is at x=1 and y=1', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const newPosition: Vec2 = { x: 1, y: 1 };

        const isAnotherPlayerPresentOnTile = (service as unknown).isAnotherPlayerPresentOnTile;
        expect(isAnotherPlayerPresentOnTile.call(service, newPosition, room)).toEqual(true);
    });

    it('should return false when current player is at x=0 and y=0', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
        const newPosition: Vec2 = { x: 0, y: 0 };

        const isAnotherPlayerPresentOnTile = (service as unknown).isAnotherPlayerPresentOnTile;
        expect(isAnotherPlayerPresentOnTile.call(service, newPosition, room)).toEqual(false);
    });

    it('should return false when no one is at x=2 and y=2', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const newPosition: Vec2 = { x: 2, y: 2 };

        const isAnotherPlayerPresentOnTile = (service as unknown).isAnotherPlayerPresentOnTile;
        expect(isAnotherPlayerPresentOnTile.call(service, newPosition, room)).toEqual(false);
    });

    it('should return a blank array when the player is trapped', () => {
        const newPosition: Vec2 = { x: 2, y: 1 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAME_TRAPPED);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile with a closed Door', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAME_TRAPPED);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile with a wall', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAME_CORRIDOR);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return the sole valid path when the player wants to move through a corridor', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_GAME_CORRIDOR);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: ['down', 'down'],
            remainingSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the sole valid path when the player wants to move through a corridor with an open door', () => {
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_UNTRAPPED);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: ['down', 'down'],
            remainingSpeed: 4,
        });
    });

    it('should return the minimum valid path when the player wants to move through a corridor surrounded by water', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_ZIG_ZAG.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_ZIG_ZAG);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: ['down', 'left', 'down', 'left'],
            remainingSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return a blank array when the player wants to move to a tile with a player on it', () => {
        const newPosition: Vec2 = { x: 1, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value', () => {
        const newPosition: Vec2 = { x: 2, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return the only possible path when the player wants to move to the furthest away tile', () => {
        const newPosition: Vec2 = { x: 2, y: 1 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: ['down', 'down', 'right', 'right', 'up'],
            remainingSpeed: 0,
        });
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (positive value)', () => {
        const newPosition: Vec2 = { x: INVALID_POSITIVE_COORDINATE, y: INVALID_POSITIVE_COORDINATE };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (negative value)', () => {
        const newPosition: Vec2 = { x: INVALID_NEGATIVE_COORDINATE, y: INVALID_NEGATIVE_COORDINATE };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value on a water map', () => {
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS_WATER);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return the only possible path when the player wants to move to the furthest away tile on a water map', () => {
        const newPosition: Vec2 = { x: 0, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS_WATER);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: ['down', 'down'],
            remainingSpeed: 1,
        });
    });

    it('should return the only possible path when the player wants to move next to the right of player 2', () => {
        const newPosition: Vec2 = { x: 3, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_WEIRD_GAME);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: ['right', 'right', 'down', 'down'],
            remainingSpeed: 1,
        });
    });

    it('should not let the current player move through player 2', () => {
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_WEIRD_GAME);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual(null);
    });

    it('should return an empty path if the player chooses their current position as a destination', () => {
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(MOCK_ROOM_WEIRD_GAME);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            path: [],
            remainingSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the only possible path when player 3 wants to move next to their closed door', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[2])) as Player;
        mockRoom.game.currentPlayer = currentPlayer.playerInfo.userName;
        const newPosition: Vec2 = { x: 3, y: 4 };
        const reachableTiles = service.dijkstraReachableTiles(mockRoom);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: ['down', 'left'],
            remainingSpeed: 2,
        });
    });

    it('should allow player 2 to move to the left-most corner', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[1])) as Player;
        mockRoom.game.currentPlayer = currentPlayer.playerInfo.userName;
        const newPosition: Vec2 = { x: 4, y: 0 };
        const reachableTiles = service.dijkstraReachableTiles(mockRoom);
        expect(service.getOptimalPath(reachableTiles, newPosition)).toEqual({
            position: newPosition,
            path: ['right', 'up', 'up', 'right'],
            remainingSpeed: 2,
        });
    });
});
