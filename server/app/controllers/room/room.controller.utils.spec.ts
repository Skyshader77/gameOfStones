import { ROOM_CODE_LENGTH } from '@app/constants/test.constants';
import { generateRoomCode } from './room.controller.utils';

describe('generateRoomCode', () => {
    it('should generate a string of length 4', () => {
        const roomCode = generateRoomCode();
        expect(roomCode.length).toBe(ROOM_CODE_LENGTH);
    });

    it('should generate a digit-only string', () => {
        const roomCode = generateRoomCode();
        const numericRegex = /^[0-9]{4}$/;
        expect(roomCode).toMatch(numericRegex);
    });
});
