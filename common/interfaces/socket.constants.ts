export enum Gateway {
    CHAT = 'chat',
    ROOM = 'room',
    GAME = 'game',
}

export enum RoomEvents {
    JOIN = 'joinRoom',
    LEAVE = 'leaveRoom',
    CREATE = 'createRoom',
    FETCH_PLAYERS = 'fetchPlayers',
    PLAYER_LIST = 'playerList',
}

export enum ChatEvents {
    Validate = 'validate',
    ValidateACK = 'validateWithAck',
    RoomChatMessage = 'roomChatMessage',

    WordValidated = 'wordValidated',
    MassMessage = 'massMessage',
    Clock = 'clock',
}
