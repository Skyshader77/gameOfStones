import { Injectable } from '@angular/core';
import { MessagingSocketService } from '@app/services/communication-services/messaging-socket.service';
import { ChatMessage } from '@common/interfaces/message';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatListService {
    private roomMessages: ChatMessage[];
    private messageSubscription?: Subscription;
    private historySubscription?: Subscription;

    constructor(private chatSocketService: MessagingSocketService) {
        this.startChat();
    }

    get messages(): ChatMessage[] {
        return [...this.roomMessages];
    }

    startChat() {
        this.roomMessages = [];
    }

    initializeChat() {
        this.cleanup();

        this.historySubscription = this.chatSocketService.listenToChatHistory().subscribe((historyMessages: ChatMessage[]) => {
            if (historyMessages && historyMessages.length > 0) {
                this.roomMessages = [...historyMessages];
            }
        });

        this.messageSubscription = this.chatSocketService.listenToChatMessage().subscribe((newMessage: ChatMessage) => {
            this.roomMessages.push(newMessage);
        });
    }

    cleanup() {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
        if (this.historySubscription) {
            this.historySubscription.unsubscribe();
        }
    }
}
