export function generateRoomCode(): string {
    const base = 36;
    const startIndex = 2;
    const length = 4;

    const roomCode = Math.random().toString(base).substr(startIndex, length).toUpperCase();
    return roomCode;
}
