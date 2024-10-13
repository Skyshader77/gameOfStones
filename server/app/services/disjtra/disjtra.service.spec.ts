import {
    CORRIDOR_OF_WALLS,
    FOUR_TILED_MOCK_GAMEMAP,
    INVALID_NEGATIVE_COORDINATE,
    INVALID_POSITIVE_COORDINATE,
    MULTIPLE_PLAYERS_PATH,
    TRAPPED_PLAYER,
    UNTRAPPED_PLAYER,
    ZIG_ZAP_PATH,
} from '@app/constants/test-constants';
import { Vec2 } from '@app/interfaces/playerPosition';
import { Test, TestingModule } from '@nestjs/testing';
import { DijstraService, PriorityQueue } from './dijstra.service';

describe('PriorityQueue', () => {
    let pq: PriorityQueue<string>;

    beforeEach(() => {
        pq = new PriorityQueue<string>();
    });

    test('should create an empty queue', () => {
        expect(pq.isEmpty()).toBe(true);
    });

    test('should enqueue and dequeue a single item', () => {
        pq.enqueue('item', 1);
        expect(pq.isEmpty()).toBe(false);
        expect(pq.dequeue()).toBe('item');
        expect(pq.isEmpty()).toBe(true);
    });

    test('should dequeue items in priority order', () => {
        pq.enqueue('low', 3);
        pq.enqueue('high', 1);
        pq.enqueue('medium', 2);

        expect(pq.dequeue()).toBe('high');
        expect(pq.dequeue()).toBe('medium');
        expect(pq.dequeue()).toBe('low');
    });

    test('should handle duplicate priorities', () => {
        pq.enqueue('first', 1);
        pq.enqueue('second', 1);
        pq.enqueue('third', 1);

        expect(pq.dequeue()).toBe('first');
        expect(pq.dequeue()).toBe('second');
        expect(pq.dequeue()).toBe('third');
    });

    test('should return undefined when dequeueing from an empty queue', () => {
        expect(pq.dequeue()).toBeUndefined();
    });
});

describe('DijstraService', () => {
    let service: DijstraService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DijstraService],
        }).compile();
        service = module.get<DijstraService>(DijstraService);
        service.gameMap = JSON.parse(JSON.stringify(FOUR_TILED_MOCK_GAMEMAP));
        service.currentPlayer = JSON.parse(JSON.stringify(FOUR_TILED_MOCK_GAMEMAP.players[0]));
    });
    it('should return true when another player is at  x=1 and y=1', () => {
        const newPosition: Vec2 = { x: 1, y: 1 };
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
        const gameMap = JSON.parse(JSON.stringify(TRAPPED_PLAYER));
        const currentPlayer = JSON.parse(JSON.stringify(TRAPPED_PLAYER.players[0]));
        const newPosition: Vec2 = { x: 1, y: 2 };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([]);
    });

    it('should return a blank array when the player wants to move to a tile with a closed Door', () => {
        const gameMap = JSON.parse(JSON.stringify(TRAPPED_PLAYER));
        const currentPlayer = JSON.parse(JSON.stringify(TRAPPED_PLAYER.players[0]));
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([]);
    });

    it('should return a blank array when the player wants to move to a tile with a wall', () => {
        const gameMap = JSON.parse(JSON.stringify(CORRIDOR_OF_WALLS));
        const currentPlayer = JSON.parse(JSON.stringify(CORRIDOR_OF_WALLS.players[0]));
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([]);
    });

    it('should return the sole valid path when the player wants to move through a corridor', () => {
        const gameMap = JSON.parse(JSON.stringify(CORRIDOR_OF_WALLS));
        const currentPlayer = JSON.parse(JSON.stringify(CORRIDOR_OF_WALLS.players[0]));
        const newPosition: Vec2 = { x: 2, y: 1 };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
        ]);
    });

    it('should return the sole valid path when the player wants to move through a corridor with an open door', () => {
        const gameMap = JSON.parse(JSON.stringify(UNTRAPPED_PLAYER));
        const currentPlayer = JSON.parse(JSON.stringify(UNTRAPPED_PLAYER.players[0]));
        const newPosition: Vec2 = { x: 2, y: 1 };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
        ]);
    });

    it('should return the minimum valid path when the player wants to move through a corridor surrounded by water', () => {
        const gameMap = JSON.parse(JSON.stringify(ZIG_ZAP_PATH));
        const currentPlayer = JSON.parse(JSON.stringify(ZIG_ZAP_PATH.players[0]));
        const newPosition: Vec2 = { x: 2, y: 0 };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 2, y: 0 },
        ]);
    });

    it('should return a blank array when the player wants to move to a tile with a player on it', () => {
        const gameMap = JSON.parse(JSON.stringify(MULTIPLE_PLAYERS_PATH));
        const currentPlayer = JSON.parse(JSON.stringify(MULTIPLE_PLAYERS_PATH.players[0]));
        const newPosition: Vec2 = { x: 0, y: 1 };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([]);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value', () => {
        const gameMap = JSON.parse(JSON.stringify(MULTIPLE_PLAYERS_PATH));
        const currentPlayer = JSON.parse(JSON.stringify(MULTIPLE_PLAYERS_PATH.players[0]));
        const newPosition: Vec2 = { x: 0, y: 2 };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([]);
    });

    it('should return the only possible path when the player wants to move to the furthest away tile', () => {
        const gameMap = JSON.parse(JSON.stringify(MULTIPLE_PLAYERS_PATH));
        const currentPlayer = JSON.parse(JSON.stringify(MULTIPLE_PLAYERS_PATH.players[0]));
        const newPosition: Vec2 = { x: 1, y: 2 };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 1, y: 2 },
        ]);
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (positive value)', () => {
        const gameMap = JSON.parse(JSON.stringify(MULTIPLE_PLAYERS_PATH));
        const currentPlayer = JSON.parse(JSON.stringify(MULTIPLE_PLAYERS_PATH.players[0]));
        const newPosition: Vec2 = { x: INVALID_POSITIVE_COORDINATE, y: INVALID_POSITIVE_COORDINATE };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([]);
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (negative value)', () => {
        const gameMap = JSON.parse(JSON.stringify(MULTIPLE_PLAYERS_PATH));
        const currentPlayer = JSON.parse(JSON.stringify(MULTIPLE_PLAYERS_PATH.players[0]));
        const newPosition: Vec2 = { x: INVALID_NEGATIVE_COORDINATE, y: INVALID_NEGATIVE_COORDINATE };
        expect(service.findShortestPath(newPosition, gameMap, currentPlayer)).toEqual([]);
    });
});
