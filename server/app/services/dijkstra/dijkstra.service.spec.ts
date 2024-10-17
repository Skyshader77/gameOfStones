import {
    INVALID_NEGATIVE_COORDINATE,
    INVALID_POSITIVE_COORDINATE,
    MOCK_ROOM_GAME_CORRIDOR,
    MOCK_ROOM_GAME_TRAPPED,
    MOCK_ROOM_MULTIPLE_PLAYERS,
    MOCK_ROOM_UNTRAPPED,
    MOCK_ROOM_ZIG_ZAG,
} from '@app/constants/player.movement.test.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import { DijsktraService } from './dijkstra.service';

describe('DijstraService', () => {
    let service: DijsktraService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DijsktraService],
        }).compile();
        service = module.get<DijsktraService>(DijsktraService);
        service.room = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR));
        service.currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR.players[0]));
    });
    it('should return true when another player is at  x=1 and y=1', () => {
        service.room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        service.currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0]));
        const newPosition: Vec2 = { x: 0, y: 1 };
        expect(service.isAnotherPlayerPresentOnTile(newPosition)).toEqual(true);
    });
    it('should return false when current player is at  x=0 and y=0', () => {
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(service.isAnotherPlayerPresentOnTile(newPosition)).toEqual(false);
    });

    it('should return false when no one is at  x=2 and y=2', () => {
        const newPosition: Vec2 = { x: 2, y: 2 };
        expect(service.isAnotherPlayerPresentOnTile(newPosition)).toEqual(false);
    });

    it('should return a blank array when the player is trapped', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED.players[0]));
        const newPosition: Vec2 = { x: 1, y: 2 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([]);
    });

    it('should return a blank array when the player wants to move to a tile with a closed Door', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED.players[0]));
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([]);
    });

    it('should return a blank array when the player wants to move to a tile with a wall', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR.players[0]));
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([]);
    });

    it('should return the sole valid path when the player wants to move through a corridor', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR.players[0]));
        const newPosition: Vec2 = { x: 2, y: 1 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
        ]);
    });

    it('should return the sole valid path when the player wants to move through a corridor with an open door', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_UNTRAPPED));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_UNTRAPPED.players[0]));
        const newPosition: Vec2 = { x: 2, y: 1 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
        ]);
    });

    it('should return the minimum valid path when the player wants to move through a corridor surrounded by water', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ZIG_ZAG));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_ZIG_ZAG.players[0]));
        const newPosition: Vec2 = { x: 2, y: 0 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 2, y: 0 },
        ]);
    });

    it('should return a blank array when the player wants to move to a tile with a player on it', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0]));
        const newPosition: Vec2 = { x: 0, y: 1 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([]);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0]));
        const newPosition: Vec2 = { x: 0, y: 2 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([]);
    });

    it('should return the only possible path when the player wants to move to the furthest away tile', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0]));
        const newPosition: Vec2 = { x: 1, y: 2 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 1, y: 2 },
        ]);
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (positive value)', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0]));
        const newPosition: Vec2 = { x: INVALID_POSITIVE_COORDINATE, y: INVALID_POSITIVE_COORDINATE };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([]);
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (negative value)', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS));
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0]));
        const newPosition: Vec2 = { x: INVALID_NEGATIVE_COORDINATE, y: INVALID_NEGATIVE_COORDINATE };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.id)).toEqual([]);
    });
});
