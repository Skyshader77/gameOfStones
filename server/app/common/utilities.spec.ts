import { MOCK_ROOM_GAMES, MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { Vec2 } from '@common/interfaces/vec2';
import { getNearestPositions, isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries } from './utilities';

describe('isAnotherPlayerPresentOnTile', () => {
    it('should return true when another player is at x=1 and y=1', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const newPosition: Vec2 = { x: 1, y: 1 };
        expect(isAnotherPlayerPresentOnTile(newPosition, room.players)).toBe(true);
    });

    it('should return false when current player is at x=0 and y=0', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor)) as RoomGame;
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(isAnotherPlayerPresentOnTile(newPosition, room.players)).toBe(false);
    });

    it('should return false when no one is at x=2 and y=2', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const newPosition: Vec2 = { x: 2, y: 2 };
        expect(isAnotherPlayerPresentOnTile(newPosition, room.players)).toBe(false);
    });
});

describe('isCoordinateWithinBoundaries', () => {
    it('should return false for an out of bounds negative position', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        expect(
            isCoordinateWithinBoundaries(
                { x: MOVEMENT_CONSTANTS.coords.invalidNegative, y: MOVEMENT_CONSTANTS.coords.invalidNegative },
                room.game.map.mapArray,
            ),
        ).toBe(false);
    });

    it('should return false for an out of bounds positive position', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        expect(
            isCoordinateWithinBoundaries(
                { x: MOVEMENT_CONSTANTS.coords.invalidPositive, y: MOVEMENT_CONSTANTS.coords.invalidPositive },
                room.game.map.mapArray,
            ),
        ).toBe(false);
    });

    it('should return true for a valid position', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        expect(isCoordinateWithinBoundaries({ x: 0, y: 0 }, room.game.map.mapArray)).toBe(true);
    });
});

describe('getNearestPositions', () => {
    it('should return 4 positions around the center for range 1', () => {
        const position: Vec2 = { x: 0, y: 0 };
        const range = 1;
        const expectedResultLength = 6;
        const result = getNearestPositions(position, range);
        expect(result.length).toBe(expectedResultLength);
        expect(result).toContainEqual({ x: 0, y: -1 });
        expect(result).toContainEqual({ x: 1, y: 1 });
        expect(result).toContainEqual({ x: -1, y: -1 });
        expect(result).toContainEqual({ x: -1, y: 0 });
        expect(result).toContainEqual({ x: 1, y: 0 });
        expect(result).toContainEqual({ x: 0, y: 1 });
    });

    it('should exclude the center position (0,0) in the result', () => {
        const position: Vec2 = { x: 0, y: 0 };
        const range = 1;
        const positions = getNearestPositions(position, range);
        expect(positions).not.toContainEqual(position);
    });
});
