export function generateRoomCode(): string {
    const min = 0;
    const max = 9999;

    const roomCode = Math.floor(Math.random() * (max - min + 1)) + min;
    return roomCode.toString().padStart(4, '0');
}
