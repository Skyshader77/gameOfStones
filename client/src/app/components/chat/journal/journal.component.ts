import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { EntryType, JournalEntry } from '@app/interfaces/journal-entry';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-journal',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './journal.component.html',
    styleUrls: [],
})
export class JournalComponent implements OnInit, AfterViewChecked {
    @ViewChild('journalContainer') journalContainer!: ElementRef;
    journalEntries: JournalEntry[] = [];
    private previousJournalCount = 0;

    ngOnInit() {
        this.journalEntries = this.initializeJournalEntries();
    }

    ngAfterViewChecked() {
        if (this.journalEntries.length !== this.previousJournalCount) {
            this.scrollToBottom(this.journalContainer);
            this.previousJournalCount = this.journalEntries.length;
        }
    }

    initializeJournalEntries(): JournalEntry[] {
        return [
            {
                date: new Date(),
                type: EntryType.TURN_START,
                message: 'Joueur X débute son tour.',
            },
            {
                date: new Date(),
                type: EntryType.COMBAT_START,
                message: 'Un combat entre joueur X et joueur Y commence',
            },
            {
                date: new Date(),
                type: EntryType.COMBAT_END,
                message: 'Le combat entre joueur X et joueur Y est terminé',
            },
            {
                date: new Date(),
                type: EntryType.COMBAT_RESULT,
                message: 'Joueur X a vaincu joueur Y',
            },
            {
                date: new Date(),
                type: EntryType.TURN_END,
                message: 'Fin du tour de Joueur X.',
            },
            {
                date: new Date(),
                type: EntryType.DOOR_OPEN,
                message: 'Joueur X a ouvert une porte.',
            },
            {
                date: new Date(),
                type: EntryType.DOOR_CLOSE,
                message: 'Joueur X a fermé une porte.',
            },
            {
                date: new Date(),
                type: EntryType.PLAYER_ABANDON,
                message: 'Joueur z a abandonné le jeu.',
            },
            {
                date: new Date(),
                type: EntryType.GAME_END,
                message: 'Fin de la partie.',
            },
        ];
    }

    private scrollToBottom(container: ElementRef): void {
        if (container) {
            const elem = container.nativeElement;
            elem.scrollTop = elem.scrollHeight;
        }
    }
}
