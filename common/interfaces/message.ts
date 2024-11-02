export interface Message {
    content: String;
    time: Date;
}

// TODO move this in common enum
export enum JournalEntry {
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

export interface JournalLog {
    message: Message;
    entry: JournalEntry;
    isPrivate: boolean;
}

export interface ChatMessage {
    message: Message;
    author: string;
}
