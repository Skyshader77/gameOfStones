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
import { Test, TestingModule } from '@nestjs/testing';
import { Pathfinding } from './dijkstra.service';
describe('DijkstraService', () => {
    let service: Pathfinding;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [Pathfinding],
        }).compile();
        service = module.get<Pathfinding>(Pathfinding);
    });
    it('should return true when another player is at  x=1 and y=1', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const newPosition: Vec2 = { x: 1, y: 1 };
        expect(Pathfinding.isAnotherPlayerPresentOnTile(newPosition, room)).toEqual(true);
    });
    it('should return false when current player is at  x=0 and y=0', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(Pathfinding.isAnotherPlayerPresentOnTile(newPosition, room)).toEqual(false);
    });

    it('should return false when no one is at  x=2 and y=2', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const newPosition: Vec2 = { x: 2, y: 2 };
        expect(Pathfinding.isAnotherPlayerPresentOnTile(newPosition, room)).toEqual(false);
    });

    it('should return a blank array when the player is trapped', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED.players[0])) as Player;
        const newPosition: Vec2 = { x: 2, y: 1 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_GAME_TRAPPED);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual(null);
    });
    

    it('should return a blank array when the player wants to move to a tile with a closed Door', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_TRAPPED.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_GAME_TRAPPED);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile with a wall', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 0 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_GAME_CORRIDOR);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual(null);
    });

    it('should return the sole valid path when the player wants to move through a corridor', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_GAME_CORRIDOR);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual({
            position: newPosition,
            path: [
                'down',
                'down',
            ],
            remainingSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the sole valid path when the player wants to move through a corridor with an open door', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_UNTRAPPED)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_UNTRAPPED.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_UNTRAPPED);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual({
            position: newPosition,
            path: [
                'down',
                'down',
            ],
            remainingSpeed: 4,
        });
    });

    it('should return the minimum valid path when the player wants to move through a corridor surrounded by water', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ZIG_ZAG)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_ZIG_ZAG.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 2 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_ZIG_ZAG);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual({
            position: newPosition,
            path: [
                'down',
                'left',
                'down',
                'left',
            ],
            remainingSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return a blank array when the player wants to move to a tile with a player on it', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 0 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
        const newPosition: Vec2 = { x: 2, y: 0 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual(null);
    });

    it('should return the only possible path when the player wants to move to the furthest away tile', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
        const newPosition: Vec2 = { x: 2, y: 1 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual({
            position: newPosition,
            path:  [
                'down',
                'down',
                'right',
                'right',
                'up'
            ],
            remainingSpeed: 0,
        });
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (positive value)', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
        const newPosition: Vec2 = { x: INVALID_POSITIVE_COORDINATE, y: INVALID_POSITIVE_COORDINATE };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile beyond the map size (negative value)', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS.players[0])) as Player;
        const newPosition: Vec2 = { x: INVALID_NEGATIVE_COORDINATE, y: INVALID_NEGATIVE_COORDINATE };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual(null);
    });

    it('should return a blank array when the player wants to move to a tile exceeding the player maximum displacement value on a water map', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS_WATER);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual(null);
    });

    it('should return the only possible path when the player wants to move to the furthest away tile on a water map', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_WATER.players[0])) as Player;
        const newPosition: Vec2 = { x: 0, y: 2 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_MULTIPLE_PLAYERS_WATER);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual({
            position: newPosition,
            path: [
                'down',
                'down',
            ],
            remainingSpeed: 1,
        });
    });

    it('should return the only possible path when the player wants to move next to the right of player 2', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[0])) as Player;
        const newPosition: Vec2 = { x: 3, y: 2 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_WEIRD_GAME);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual({
            position: newPosition,
            path:  [
                'right',
                'right',
                'down',
                'down',
            ],
            remainingSpeed: 1,
        });
    });

    it('should not let the current player move through player 2', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 2 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_WEIRD_GAME);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual(null);
    });

    it('should return an empty path if the player chooses their current position as a destination', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[0])) as Player;
        const newPosition: Vec2 = { x: 1, y: 0 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(MOCK_ROOM_WEIRD_GAME);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual({
            position: currentPlayer.playerInGame.currentPosition,
            path:  [],
            remainingSpeed: currentPlayer.playerInGame.remainingMovement,
        });
    });

    it('should return the only possible path when player 3 wants to move next to their closed door', () => {
        let mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[2])) as Player;
        mockRoom.game.currentPlayer=currentPlayer.playerInfo.userName;
        const newPosition: Vec2 = { x: 3, y: 4 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(mockRoom);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual({
            position: newPosition,
            path:  [
                'down',
                'left',
            ],
            remainingSpeed: 2,
        });
    });

    it('should allow player 2 to move to the left-most corner', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME)) as RoomGame;
        const currentPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_WEIRD_GAME.players[1])) as Player;
        mockRoom.game.currentPlayer=currentPlayer.playerInfo.userName;
        const newPosition: Vec2 = { x: 4, y: 0 };
        const reachableTiles=Pathfinding.dijkstraReachableTiles(mockRoom);
        expect(Pathfinding.getOptimalPath(reachableTiles,newPosition)).toEqual({
            position: newPosition,
            path:  [
                'right',
                'up',
                'up',
                'right',
            ],
            remainingSpeed: 2,
        });
    });
});
