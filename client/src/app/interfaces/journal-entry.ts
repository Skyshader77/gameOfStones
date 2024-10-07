export enum EntryType {
    TURNSTART,
    COMBATSTART,
    COMBATEND,
    COMBATRESULT,
    DOOROPEN,
    DOORCLOSE,
    PLAYERABANDON,
    GAMEEND,
}

export interface JournalEntry {
    date: Date;
    type: EntryType;
    message: string;
}
