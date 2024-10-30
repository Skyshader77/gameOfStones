export enum RoomEvents {
    JoinError = 'error',
    DesireJoinRoom = 'desireJoinRoom',
    Join = 'joinRoom',
    Leave = 'leaveRoom',
    Create = 'createRoom',
    AddPlayer = 'addPlayer',
    RemovePlayer = 'removePlayer',
    PlayerList = 'playerList',
    DesireKickPlayer = 'desireKickPlayer',
    DesireToggleLock = 'desireToggleLock',
    ToggleLock = 'toggleLock',
    RoomLocked = 'roomLocked',
    RoomClosed = 'roomClosed',
    PlayerLimitReached = 'playerLimitReached',
}
