export enum EntryType {
    TurnStart,
    CombatStart,
    CombatEnd,
    CombatResult,
    TurnEnd,
    DoorOpen,
    DoorClose,
    PlayerAbandon,
    GameEnd,
}

export interface JournalEntry {
    date: Date;
    type: EntryType;
    message: string;
}
