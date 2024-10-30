import { Injectable } from '@angular/core';
import { Gateway } from '@common/constants/gateway.constants';
import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { MessagingEvents } from '@common/interfaces/sockets.events/chat.events';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class MessagingSocketService {
    constructor(private socketService: SocketService) {}

    sendMessage(author: string, message: string): void {
        const chatMessage: ChatMessage = {
            author,
            message: {
                message,
                time: new Date(),
            },
        };
        this.socketService.emit(Gateway.MESSAGING, MessagingEvents.DesiredChatMessage, chatMessage);
    }

    listenToChatMessage(): Observable<ChatMessage> {
        return this.socketService.on<ChatMessage>(Gateway.MESSAGING, MessagingEvents.ChatMessage);
    }

    listenToChatHistory(): Observable<ChatMessage[]> {
        return this.socketService.on<ChatMessage[]>(Gateway.MESSAGING, MessagingEvents.ChatHistory);
    }

    listenToJournal(): Observable<JournalLog> {
        return this.socketService.on<JournalLog>(Gateway.MESSAGING, MessagingEvents.JournalLog);
    }
}
