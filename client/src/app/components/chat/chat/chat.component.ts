import { AfterViewChecked, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatClientService } from '@app/services/chat-service/chat-client.service';
import { ChatSocketService } from '@app/services/communication-services/chat-socket.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

// temp values for random user names
const threeDigits = 1000;
const padding = 3;

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [FontAwesomeModule, FormsModule],
    templateUrl: './chat.component.html',
    styleUrls: [],
})
export class ChatComponent implements AfterViewChecked, OnInit {
    @ViewChild('chatContainer') chatContainer!: ElementRef;
    paperPlaneIcon = faPaperPlane;
    author: string =
        'User' +
        Math.floor(Math.random() * threeDigits)
            .toString()
            .padStart(padding, '0');

    message: string = '';
    private previousMessageCount = 0;

    constructor(
        protected chatService: ChatClientService,
        private chatSocketService: ChatSocketService,
    ) {}

    ngOnInit() {
        this.chatService.initializeChat();
    }

    ngAfterViewChecked() {
        if (this.chatService.messages.length !== this.previousMessageCount) {
            this.scrollToBottom();
            this.previousMessageCount = this.chatService.messages.length;
        }
    }

    sendMessage() {
        if (this.chatService.isValidMessage(this.message)) {
            this.chatSocketService.sendMessage(this.author, this.message);
            this.message = '';
        }
    }

    private scrollToBottom(): void {
        const container = this.chatContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
    }
}
