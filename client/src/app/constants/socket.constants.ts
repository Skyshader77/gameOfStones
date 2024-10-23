export enum SocketRole {
    CHAT = 'chat',
    JOURNAL = 'journal',
    ROOM = 'room',
    GAME = 'game',
}

export enum RoomEvents {
    JOIN = 'joinRoom',
    LEAVE = 'leaveRoom',
    CREATE = 'createRoom',
    FETCH_PLAYERS = 'fetchPlayers',
    PLAYER_LIST = 'playerList',
    DESIRE_KICK_PLAYER = 'desireKickPlayer',
}
