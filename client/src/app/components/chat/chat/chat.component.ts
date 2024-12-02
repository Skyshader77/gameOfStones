import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CHAT_INPUT_PLACEHOLDER } from '@app/constants/chat.constants';
import { ChatListService } from '@app/services/chat-service/chat-list.service';
import { MessagingSocketService } from '@app/services/communication-services/messaging-socket/messaging-socket.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { MAX_CHAT_MESSAGE_LENGTH } from '@common/constants/chat.constants';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, FormsModule, DatePipe],
    templateUrl: './chat.component.html',
    styleUrls: [],
})
export class ChatComponent implements AfterViewChecked, OnDestroy {
    @ViewChild('chatContainer') chatContainer!: ElementRef;
    paperPlaneIcon = faPaperPlane;
    message: string = '';
    maxMessageLength = MAX_CHAT_MESSAGE_LENGTH;
    chatPlaceholder = CHAT_INPUT_PLACEHOLDER;
    private previousMessageCount = 0;

    constructor(
        private chatListService: ChatListService,
        private chatSocketService: MessagingSocketService,
        private myPlayerService: MyPlayerService,
    ) {}

    get messages() {
        return this.chatListService.messages;
    }

    get userName() {
        return this.myPlayerService.getUserName();
    }

    ngAfterViewChecked() {
        if (this.chatListService.messages?.length !== this.previousMessageCount) {
            this.scrollToBottom();
            this.previousMessageCount = this.chatListService.messages?.length;
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
