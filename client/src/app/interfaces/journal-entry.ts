export enum EntryType {
    TURN_START,
    COMBAT_START,
    COMBAT_END,
    COMBAT_RESULT,
    TURN_END,
    DOOR_OPEN,
    DOOR_CLOSE,
    PLAYER_ABANDON,
    PLAYER_WIN,
    GAME_END,
}

export interface JournalEntry {
    date: Date;
    type: EntryType;
    message: string;
}
