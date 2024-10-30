import { AfterViewChecked, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatClientService } from '@app/services/chat-service/chat-client.service';
import { ChatSocketService } from '@app/services/communication-services/chat-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { formatTime } from '@app/services/utilitary/time-formatting.service';

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
    formatTime = formatTime;
    message: string = '';
    private previousMessageCount = 0;

    constructor(
        protected chatClientService: ChatClientService,
        private chatSocketService: ChatSocketService,
        protected myPlayerService: MyPlayerService,
    ) {}

    ngOnInit() {
        this.chatClientService.initializeChat();
    }

    ngAfterViewChecked() {
        if (this.chatClientService.messages.length !== this.previousMessageCount) {
            this.scrollToBottom();
            this.previousMessageCount = this.chatClientService.messages.length;
        }
    }

    sendMessage() {
        this.chatSocketService.sendMessage(this.myPlayerService.getUserName(), this.message);
        this.message = '';
    }

    private scrollToBottom(): void {
        const container = this.chatContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
    }
}
