import { Injectable } from '@angular/core';
import { ChatSocketService } from '@app/services/communication-services/chat-socket.service';
import { ChatMessage } from '@common/interfaces/message';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatListService {
    private roomMessages: ChatMessage[] = [];
    private messageSubscription?: Subscription;
    private historySubscription?: Subscription;

    constructor(private chatSocketService: ChatSocketService) {}

    get messages(): ChatMessage[] {
        return [...this.roomMessages];
    }

    initializeChat() {
        this.cleanup();

        this.roomMessages = [];

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
