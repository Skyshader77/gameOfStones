import { generateRoomCode } from './room.controller.utils';
import { ROOM_CODE_LENGTH } from '@app/constants/test-constants';

describe('generateRoomCode', () => {
    it('should generate a string of length 4', () => {
        const roomCode = generateRoomCode();
        expect(roomCode.length).toBe(ROOM_CODE_LENGTH);
    });

    it('should generate an uppercase alphanumeric string', () => {
        const roomCode = generateRoomCode();
        const alphanumericRegex = /^[A-Z0-9]{4}$/;
        expect(roomCode).toMatch(alphanumericRegex);
    });

    it('should generate different codes on consecutive calls', () => {
        const roomCode1 = generateRoomCode();
        const roomCode2 = generateRoomCode();
        expect(roomCode1).not.toBe(roomCode2);
    });
});
