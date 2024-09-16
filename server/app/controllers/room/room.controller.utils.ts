export function generateRoomCode(): string {
    //Generate a random 4 character string
    const roomCode = Math.random().toString(36).substr(2, 4).toUpperCase();
    return roomCode;
}
