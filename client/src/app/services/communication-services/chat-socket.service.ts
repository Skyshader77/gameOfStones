import { Injectable } from '@angular/core';
import { Gateway } from '@common/constants/gateway.constants';
import { ChatMessage } from '@common/interfaces/message';
import { ChatEvents } from '@common/interfaces/sockets.events/chat.events';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class ChatSocketService {
    private messageSubscription: Subscription | null = null;
    private historySubscription: Subscription | null = null;

    constructor(private socketService: SocketService) {}

    unsubscribeFromMessages(): void {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
            this.messageSubscription = null;
        }
        if (this.historySubscription) {
            this.historySubscription.unsubscribe();
            this.historySubscription = null;
        }
    }

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

    onJoin(): Observable<ChatMessage[]> {
        return this.socketService.on<ChatMessage[]>(Gateway.CHAT, ChatEvents.ChatHistory);
    }
}
