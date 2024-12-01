import { ROOM_CODE_LENGTH } from '@app/constants/test.constants';

export function generateRoomCode(): string {
    const MIN_ROOM_CODE = 0;
    const MAX_ROOM_CODE = 9999;

    const roomCode = Math.floor(Math.random() * (MAX_ROOM_CODE - MIN_ROOM_CODE + 1)) + MIN_ROOM_CODE;
    return roomCode.toString().padStart(ROOM_CODE_LENGTH, '0');
}
