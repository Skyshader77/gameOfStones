import { Injectable } from '@angular/core';
import { ChatMessage } from '@common/interfaces/message';
import { MIN_CHAT_MESSAGE_LENGTH, MAX_CHAT_MESSAGE_LENGTH } from '@app/constants/validation.constants';
import { ChatSocketService } from '@app/services/communication-services/chat-socket.service';

@Injectable({
    providedIn: 'root',
})
export class ChatClientService {
    roomMessages: ChatMessage[] = [];
    constructor(private chatSocketService: ChatSocketService) {
        this.chatSocketService.subscribeToMessages((roomMessage: ChatMessage) => {
            this.roomMessages.push(roomMessage);
        });
    }

    get getMessages(): ChatMessage[] {
        return this.roomMessages;
    }

    isValidMessage(message: string): boolean {
        return message.length >= MIN_CHAT_MESSAGE_LENGTH && message.length <= MAX_CHAT_MESSAGE_LENGTH;
    }
}
