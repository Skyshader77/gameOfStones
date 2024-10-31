import { Component } from '@angular/core';
import { DisplayMode } from '@app/constants/chat.constants';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { JournalComponent } from '@app/components/chat/journal/journal.component';
import { faBook, faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-game-chat',
    standalone: true,
    imports: [FontAwesomeModule, ChatComponent, JournalComponent],
    templateUrl: './game-chat.component.html',
})
export class GameChatComponent {
    displayMode: DisplayMode = DisplayMode.Chat;
    displayModeAccessor = DisplayMode;

    faComments = faComments;
    faBook = faBook;

    // TODO fix the size of the buttons to allow for seamless scrolling

    changeDisplay(mode: DisplayMode) {
        this.displayMode = mode;
    }
}
