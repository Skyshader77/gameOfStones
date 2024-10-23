import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { ChatEvents, Gateway } from '@common/interfaces/socket.constants';
import { ChatMessage } from '@common/interfaces/message';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatSocketService {
    constructor(private socketService: SocketService) {}

    sendMessage(author: string, message: string): void {
        const chatMessage: ChatMessage = {
            author,
            message: {
                message,
                time: new Date(),
            },
        };
        this.socketService.emit(Gateway.CHAT, ChatEvents.RoomChatMessage, chatMessage);
    }

    onMessage(): Observable<ChatMessage> {
        return this.socketService.on<ChatMessage>(Gateway.CHAT, ChatEvents.RoomChatMessage);
    }
}
