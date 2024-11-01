import { MOCK_ROOM_GAME_CORRIDOR, MOCK_ROOM_MULTIPLE_PLAYERS } from '@app/constants/player.movement.test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { Vec2 } from '@common/interfaces/vec2';
import { isAnotherPlayerPresentOnTile } from './utilities';

describe('isAnotherPlayerPresentOnTile', () => {
    it('should return true when another player is at x=1 and y=1', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const newPosition: Vec2 = { x: 1, y: 1 };
        expect(isAnotherPlayerPresentOnTile(newPosition, room)).toBe(true);
    });

    it('should return false when current player is at x=0 and y=0', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_CORRIDOR)) as RoomGame;
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(isAnotherPlayerPresentOnTile(newPosition, room)).toBe(false);
    });

    it('should return false when no one is at x=2 and y=2', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS)) as RoomGame;
        const newPosition: Vec2 = { x: 2, y: 2 };
        expect(isAnotherPlayerPresentOnTile(newPosition, room)).toBe(false);
    });
});
