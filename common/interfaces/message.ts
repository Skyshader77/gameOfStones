export interface Message {
    message: String;
    time: Date;
}

export interface JournalMessage {
    message: Message;
    isPrivate: boolean;
}

export interface ChatMessage {
    message: Message;
    author: string;
}
