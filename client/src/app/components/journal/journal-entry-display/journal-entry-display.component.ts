import { Component, Input } from '@angular/core';
import { JournalEntry } from '@app/interfaces/journal-entry';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-journal-entry-display',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './journal-entry-display.component.html',
})
export class JournalEntryDisplayComponent {
    @Input() journalEntries: JournalEntry[] = [];
}
