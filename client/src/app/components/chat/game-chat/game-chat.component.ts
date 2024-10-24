import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DisplayMode } from '@app/constants/chat.constants';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { JournalComponent } from '@app/components/chat/journal/journal.component';

@Component({
    selector: 'app-game-chat',
    standalone: true,
    imports: [DatePipe, ChatComponent, JournalComponent],
    templateUrl: './game-chat.component.html',
})
export class GameChatComponent {
    displayMode: DisplayMode = DisplayMode.CHAT;
    displayModeAccessor = DisplayMode;

    toggleDisplay() {
        this.displayMode = this.displayMode === DisplayMode.CHAT ? DisplayMode.JOURNAL : DisplayMode.CHAT;
    }
}
