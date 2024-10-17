import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/communication-services/socket.service';
import { ChatMessage } from '@app/interfaces/chat-message';
import { SocketRole } from '@app/constants/socket.constants';
import { Observable } from 'rxjs';
import { MIN_CHAT_MESSAGE_LENGTH, MAX_CHAT_MESSAGE_LENGTH } from '@app/constants/validation.constants';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(private socketService: SocketService) {}

    sendMessage(author: string, message: string): void {
        if (this.isValidMessage(message)) {
            const chatMessage: ChatMessage = {
                author,
                message,
                date: new Date(),
            };
            this.socketService.emit(SocketRole.CHAT, 'roomMessage', chatMessage);
        }
    }

    onMessage(): Observable<ChatMessage> {
        return this.socketService.on<ChatMessage>(SocketRole.CHAT, 'roomMessage');
    }

    joinRoom(roomId: string): void {
        this.socketService.joinRoom(roomId);
    }

    private isValidMessage(message: string): boolean {
        return message.length >= MIN_CHAT_MESSAGE_LENGTH && message.length <= MAX_CHAT_MESSAGE_LENGTH;
    }
}
