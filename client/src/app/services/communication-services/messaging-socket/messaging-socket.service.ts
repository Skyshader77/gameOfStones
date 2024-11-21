import { Injectable } from '@angular/core';
import { Gateway } from '@common/enums/gateway.enum';
import { MessagingEvents } from '@common/enums/sockets.events/messaging.events';
import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { Observable } from 'rxjs';
import { SocketService } from '../socket/socket.service';

@Injectable({
    providedIn: 'root',
})
export class MessagingSocketService {
    constructor(private socketService: SocketService) {}

    sendMessage(author: string, message: string): void {
        const chatMessage: ChatMessage = {
            author,
            message: {
                content: message,
                time: new Date(),
            },
        };
        this.socketService.emit(Gateway.Messaging, MessagingEvents.DesiredChatMessage, chatMessage);
    }

    listenToChatMessage(): Observable<ChatMessage> {
        return this.socketService.on<ChatMessage>(Gateway.Messaging, MessagingEvents.ChatMessage);
    }

    listenToChatHistory(): Observable<ChatMessage[]> {
        return this.socketService.on<ChatMessage[]>(Gateway.Messaging, MessagingEvents.ChatHistory);
    }

    listenToJournal(): Observable<JournalLog> {
        return this.socketService.on<JournalLog>(Gateway.Messaging, MessagingEvents.JournalLog);
    }
}
