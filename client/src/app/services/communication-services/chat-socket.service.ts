import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { SocketRole } from '@app/constants/socket.constants';
import { ChatMessage } from '@app/interfaces/chat-message';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatSocketService {
    constructor(private socketService: SocketService) {}

    sendMessage(author: string, message: string): void {
        const chatMessage: ChatMessage = {
            author,
            message,
            date: new Date(),
        };
        this.socketService.emit(SocketRole.CHAT, 'roomMessage', chatMessage);
    }

    onMessage(): Observable<ChatMessage> {
        return this.socketService.on<ChatMessage>(SocketRole.CHAT, 'roomMessage');
    }
}
