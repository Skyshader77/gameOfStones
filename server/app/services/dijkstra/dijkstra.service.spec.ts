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
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import { DijkstraService } from './dijkstra.service';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';

describe('DijkstraService', () => {
    let service: DijkstraService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DijkstraService],
        }).compile();
        service = module.get<DijkstraService>(DijkstraService);
    });
    it('should return true when another player is at  x=1 and y=1', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const newPosition: Vec2 = { x: 0, y: 1 };
        expect(service.isAnotherPlayerPresentOnTile(newPosition, room)).toEqual(true);
    });
    it('should return false when current player is at  x=0 and y=0', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(service.isAnotherPlayerPresentOnTile(newPosition, room)).toEqual(false);
    });

    it('should return false when no one is at  x=2 and y=2', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const newPosition: Vec2 = { x: 2, y: 2 };
        expect(service.isAnotherPlayerPresentOnTile(newPosition, room)).toEqual(false);
    });

    it('should return a blank array when the player is trapped', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 2 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return a blank array when the player wants to move to a tile with a closed Door', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return a blank array when the player wants to move to a tile with a wall', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the sole valid path when the player wants to move through a corridor', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR.players[0])) as Player;
        const newPosition: Vec2 = { x: 2, y: 1 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: newPosition,
            displacementVector: [
                { x: 0, y: 1 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
            ],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the sole valid path when the player wants to move through a corridor with an open door', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_UNTRAPPED)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_UNTRAPPED.players[0])) as Player;
        const newPosition: Vec2 = { x: 2, y: 1 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: newPosition,
            displacementVector: [
                { x: 0, y: 1 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
            ],
            remainingPlayerSpeed: 4,
        });
    });

    it('should return the minimum valid path when the player wants to move through a corridor surrounded by water', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ZIG_ZAG)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_ZIG_ZAG.players[0])) as Player;
        const newPosition: Vec2 = { x: 2, y: 0 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: newPosition,
            displacementVector: [
                { x: 0, y: 2 },
                { x: 1, y: 2 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 2, y: 0 },
            ],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return a blank array when the player wants to move to a tile with a player on it', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 1 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 2 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the only possible path when the player wants to move to the furthest away tile', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 2 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: newPosition,
            displacementVector: [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 2, y: 1 },
                { x: 2, y: 2 },
                { x: 1, y: 2 },
            ],
            remainingPlayerSpeed: 0,
        });
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (positive value)', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
        const newPosition: Vec2 = { x: INVALID_POSITIVE_COORDINATE, y: INVALID_POSITIVE_COORDINATE };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (negative value)', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
        const newPosition: Vec2 = { x: INVALID_NEGATIVE_COORDINATE, y: INVALID_NEGATIVE_COORDINATE };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value on a water map', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER.players[0])) as Player;
        const newPosition: Vec2 = { x: 2, y: 1 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the only possible path when the player wants to move to the furthest away tile on a water map', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER.players[0])) as Player;
        const newPosition: Vec2 = { x: 2, y: 0 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: newPosition,
            displacementVector: [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
            ],
            remainingPlayerSpeed: 1,
        });
    });

    it('should return the only possible path when the player wants to move next to the right of player 2', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[0])) as Player;
        const newPosition: Vec2 = { x: 2, y: 3 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: newPosition,
            displacementVector: [
                { x: 0, y: 1 },
                { x: 0, y: 2 },
                { x: 0, y: 3 },
                { x: 1, y: 3 },
                { x: 2, y: 3 },
            ],
            remainingPlayerSpeed: 1,
        });
    });

    it('should not let the current player move through player 2', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[0])) as Player;
        const newPosition: Vec2 = { x: 2, y: 1 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return an empty array if the player chooses their current position as a destination', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 1 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the only possible path when player 3 wants to move next to their closed door', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[2])) as Player;
        const newPosition: Vec2 = { x: 4, y: 3 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).toEqual({
            position: newPosition,
            displacementVector: [
                { x: 3, y: 4 },
                { x: 4, y: 4 },
                { x: 4, y: 3 },
            ],
            remainingPlayerSpeed: 2,
        });
    });

    it('should allow player 2 to move to the left-most corner', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[1])) as Player;
        const newPosition: Vec2 = { x: 0, y: 4 };
        expect(service.findShortestPath(newPosition, mockRoom, currentPlayer.playerInfo.id)).not.toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            displacementVector: [],
            remainingPlayerSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });
});
