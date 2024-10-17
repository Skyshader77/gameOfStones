import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '@app/interfaces/chat-message';
import { ChatService } from '@app/services/chat-service/chat-client.service';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// temp values for random user names
const threeDigits = 1000;
const padding = 3;

@Component({
    selector: 'app-room-chat',
    standalone: true,
    imports: [FormsModule, FontAwesomeModule],
    templateUrl: './room-chat.component.html',
})
export class RoomChatComponent implements OnInit, AfterViewChecked {
    @ViewChild('roomChatContainer') roomChatContainer!: ElementRef;

    // temp author name, will be replaced by player name
    author: string =
        'User' +
        Math.floor(Math.random() * threeDigits)
            .toString()
            .padStart(padding, '0');

    message: string = '';
    serverMessages: string[] = [];
    roomMessages: ChatMessage[] = [];
    paperPlaneIcon = faPaperPlane;

    private previousMessageCount = 0;

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        this.chatService.joinRoom('serverRoom');
        this.configureBaseSocketFeatures();
    }

    ngAfterViewChecked() {
        if (this.roomMessages.length !== this.previousMessageCount) {
            this.scrollToBottom();
            this.previousMessageCount = this.roomMessages.length;
        }
    }

    configureBaseSocketFeatures() {
        this.chatService.onMessage().subscribe((roomMessage: ChatMessage) => {
            this.roomMessages.push(roomMessage);
            this.scrollToBottom();
        });
    }

    sendToRoom() {
        this.chatService.sendMessage(this.author, this.message);
        this.message = '';
    }

    private scrollToBottom(): void {
        const container = this.roomChatContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
    }
}
