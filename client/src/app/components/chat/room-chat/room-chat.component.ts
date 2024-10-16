import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '@app/interfaces/chat-message';
import { ChatClientService } from '@app/services/chat-service/chat-client.service';
import { MIN_CHAT_MESSAGE_LENGTH, MAX_CHAT_MESSAGE_LENGTH } from '@app/constants/validation.constants';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-room-chat',
    standalone: true,
    imports: [FormsModule, FontAwesomeModule],
    templateUrl: './room-chat.component.html',
})
export class RoomChatComponent implements OnInit, AfterViewChecked {
    @ViewChild('roomChatContainer') roomChatContainer!: ElementRef;

    message: string = '';
    serverMessages: string[] = [];
    roomMessages: ChatMessage[] = [];
    paperPlaneIcon = faPaperPlane;

    private previousMessageCount = 0;

    constructor(public socketService: ChatClientService) {}
    
    ngOnInit(): void {
        this.connect();
        this.joinRoom();
    }

    ngAfterViewChecked() {
        if (this.roomMessages.length !== this.previousMessageCount) {
            this.scrollToBottom();
            this.previousMessageCount = this.roomMessages.length;
        }
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
    }

    configureBaseSocketFeatures() {
        this.socketService.on('roomMessage', (roomMessage: ChatMessage) => {
            this.roomMessages.push(roomMessage);
        });
    }

    sendToRoom() {
        if (this.isValidMessage(this.message)) {
            this.socketService.send('roomMessage', this.message);
            this.message = '';
        }
    }

    isValidMessage(message: string): boolean {
        return message.length >= MIN_CHAT_MESSAGE_LENGTH && message.length <= MAX_CHAT_MESSAGE_LENGTH;
    }

    joinRoom() {
        this.socketService.send('joinRoom');
    }

    private scrollToBottom(): void {
        const container = this.roomChatContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
    }
}