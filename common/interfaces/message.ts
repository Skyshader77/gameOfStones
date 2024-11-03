import { JournalEntry } from '@common/enums/journal-entry.enum';

export interface Message {
    content: String;
    time: Date;
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
