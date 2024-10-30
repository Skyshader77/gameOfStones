import { Injectable } from '@angular/core';
import { Gateway } from '@common/constants/gateway.constants';
import { ChatMessage } from '@common/interfaces/message';
import { ChatEvents } from '@common/interfaces/sockets.events/chat.events';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service';

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
        this.socketService.emit(Gateway.CHAT, ChatEvents.DesiredChatMessage, chatMessage);
    }

    onMessage(): Observable<ChatMessage> {
        return this.socketService.on<ChatMessage>(Gateway.CHAT, ChatEvents.ChatMessage);
    }

    onJoin(): Observable<ChatMessage[]> {
        return this.socketService.on<ChatMessage[]>(Gateway.CHAT, ChatEvents.ChatHistory);
    }
}
