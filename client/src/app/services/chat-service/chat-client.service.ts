import { Injectable, OnDestroy } from '@angular/core';
import { MAX_CHAT_MESSAGE_LENGTH, MIN_CHAT_MESSAGE_LENGTH } from '@app/constants/validation.constants';
import { ChatSocketService } from '@app/services/communication-services/chat-socket.service';
import { ChatMessage } from '@common/interfaces/message';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatClientService implements OnDestroy {
    roomMessages: ChatMessage[] = [];
    private messageSubscription?: Subscription;
    private historySubscription?: Subscription;

    constructor(private chatSocketService: ChatSocketService) {}

    get messages(): ChatMessage[] {
        return [...this.roomMessages];
    }

    initializeChat() {
        this.cleanup();

        this.roomMessages = [];

        this.historySubscription = this.chatSocketService.onJoin().subscribe((historyMessages: ChatMessage[]) => {
            if (historyMessages && historyMessages.length > 0) {
                this.roomMessages = [...historyMessages];
            }
        });

        this.messageSubscription = this.chatSocketService.onMessage().subscribe((newMessage: ChatMessage) => {
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
        this.chatSocketService.unsubscribeFromMessages();
    }

    isValidMessage(message: string): boolean {
        return message.length >= MIN_CHAT_MESSAGE_LENGTH && message.length <= MAX_CHAT_MESSAGE_LENGTH;
    }

    ngOnDestroy() {
        this.cleanup();
    }
}
