import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { JournalComponent } from '@app/components/chat/journal/journal.component';
import { DisplayMode } from '@app/constants/chat.constants';
import { ChatListService } from '@app/services/chat-service/chat-list.service';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBook, faComments } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-game-chat',
    standalone: true,
    imports: [FontAwesomeModule, ChatComponent, JournalComponent],
    templateUrl: './game-chat.component.html',
})
export class GameChatComponent implements OnInit, OnDestroy {
    displayMode: DisplayMode = DisplayMode.Chat;
    displayModeAccessor = DisplayMode;

    faComments = faComments;
    faBook = faBook;

    constructor(
        private chatListService: ChatListService,
        private journalListService: JournalListService,
    ) {}

    ngOnInit() {
        this.chatListService.initializeChat();
        this.journalListService.initializeJournal();
    }

    ngOnDestroy() {
        this.journalListService.cleanup();
    }

    changeDisplay(mode: DisplayMode) {
        this.displayMode = mode;
    }
}
