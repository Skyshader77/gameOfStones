import { AfterViewChecked, Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatListService } from '@app/services/chat-service/chat-list.service';
import { MessagingSocketService } from '@app/services/communication-services/messaging-socket.service';
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
export class ChatComponent implements AfterViewChecked, OnInit, OnDestroy {
    @ViewChild('chatContainer') chatContainer!: ElementRef;
    paperPlaneIcon = faPaperPlane;
    formatTime = formatTime;
    message: string = '';
    private previousMessageCount = 0;

    constructor(
        protected chatListService: ChatListService,
        private chatSocketService: MessagingSocketService,
        protected myPlayerService: MyPlayerService,
    ) {}

    ngOnInit() {
        this.chatListService.initializeChat();
    }

    ngAfterViewChecked() {
        if (this.chatListService.messages.length !== this.previousMessageCount) {
            this.scrollToBottom();
            this.previousMessageCount = this.chatListService.messages.length;
        }
    }

    sendMessage() {
        this.chatSocketService.sendMessage(this.myPlayerService.getUserName(), this.message);
        this.message = '';
    }

    ngOnDestroy() {
        this.chatListService.cleanup();
    }

    private scrollToBottom(): void {
        const container = this.chatContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
    }
}
