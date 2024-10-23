import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Gateway } from '@common/interfaces/gateway.constants';
import { ChatEvents } from '@common/interfaces/sockets.events/chat.events';
import { ChatMessage } from '@common/interfaces/message';
import { Observable, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatSocketService {
    private messageSubscription: Subscription | null = null;

    constructor(private socketService: SocketService) {}

    subscribeToMessages(onMessageReceived: (message: ChatMessage) => void): void {
        this.messageSubscription = this.socketService.on<ChatMessage>(Gateway.CHAT, ChatEvents.RoomChatMessage).subscribe(onMessageReceived);
    }

    unsubscribeFromMessages(): void {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
            this.messageSubscription = null;
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
}
