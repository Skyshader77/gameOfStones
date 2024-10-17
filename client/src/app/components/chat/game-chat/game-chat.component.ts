import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '@app/interfaces/chat-message';
import { ChatService } from '@app/services/chat-service/chat-client.service';
import { JournalEntry, EntryType } from '@app/interfaces/journal-entry';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DatePipe } from '@angular/common';

// temp values for random user names
const threeDigits = 1000;
const padding = 3;

@Component({
    selector: 'app-game-chat',
    standalone: true,
    imports: [FormsModule, FontAwesomeModule, DatePipe],
    templateUrl: './game-chat.component.html',
})
export class GameChatComponent implements OnInit, AfterViewChecked {
    @ViewChild('gameChatContainer') gameChatContainer!: ElementRef;
    @ViewChild('journalContainer') journalContainer!: ElementRef;

    // temp author name, will be replaced by player name
    author: string =
        'User' +
        Math.floor(Math.random() * threeDigits)
            .toString()
            .padStart(padding, '0');

    displayChat: boolean = true;

    message: string = '';

    serverMessages: string[] = [];
    roomMessages: ChatMessage[] = [];
    journalEntries: JournalEntry[] = [];

    paperPlaneIcon = faPaperPlane;

    private previousMessageCount = 0;
    private previousJournalCount = 0;

    constructor(public chatService: ChatService) {
        this.journalEntries = this.initializeJournalEntries();
    }

    ngOnInit(): void {
        this.chatService.joinRoom('serverRoom');
        this.configureBaseSocketFeatures();
    }

    ngAfterViewChecked() {
        if (this.roomMessages.length !== this.previousMessageCount) {
            this.scrollToBottom(this.gameChatContainer);
            this.previousMessageCount = this.roomMessages.length;
        }

        if (this.journalEntries.length !== this.previousJournalCount) {
            this.scrollToBottom(this.journalContainer);
            this.previousJournalCount = this.journalEntries.length;
        }
    }

    initializeJournalEntries(): JournalEntry[] {
        return [
            {
                date: new Date(),
                type: EntryType.TurnStart,
                message: 'Joueur X débute son tour.',
            },
            {
                date: new Date(),
                type: EntryType.CombatStart,
                message: 'Un combat entre joueur X et joueur Y commence',
            },
            {
                date: new Date(),
                type: EntryType.CombatEnd,
                message: 'Le combat entre joueur X et joueur Y est terminé',
            },
            {
                date: new Date(),
                type: EntryType.CombatResult,
                message: 'Joueur X a vaincu joueur Y',
            },
            {
                date: new Date(),
                type: EntryType.TurnEnd,
                message: 'Fin du tour de Joueur X.',
            },
            {
                date: new Date(),
                type: EntryType.DoorOpen,
                message: 'Joueur X a ouvert une porte.',
            },
            {
                date: new Date(),
                type: EntryType.DoorClose,
                message: 'Joueur X a fermé une porte.',
            },
            {
                date: new Date(),
                type: EntryType.PlayerAbandon,
                message: 'Joueur z a abandonné le jeu.',
            },
            {
                date: new Date(),
                type: EntryType.GameEnd,
                message: 'Fin de la partie.',
            },
        ];
    }

    configureBaseSocketFeatures() {
        this.chatService.onMessage().subscribe((roomMessage: ChatMessage) => {
            this.roomMessages.push(roomMessage);
            this.scrollToBottom(this.gameChatContainer);
        });
    }

    sendToRoom() {
        this.chatService.sendMessage(this.author, this.message);
        this.message = '';
    }

    toggleDisplay() {
        this.displayChat = !this.displayChat;
    }

    private scrollToBottom(container: ElementRef): void {
        if (container) {
            const elem = container.nativeElement;
            elem.scrollTop = elem.scrollHeight;
        }
    }
}
