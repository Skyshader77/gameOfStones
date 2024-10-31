import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-journal',
    standalone: true,
    imports: [DatePipe, FormsModule],
    templateUrl: './journal.component.html',
    styleUrls: [],
})
export class JournalComponent implements OnInit, AfterViewChecked, OnDestroy {
    @ViewChild('journalContainer') journalContainer!: ElementRef;

    onlyPrivate: boolean = false;

    private previousJournalCount = 0;

    constructor(public journalListService: JournalListService) {}

    ngOnInit() {
        this.journalListService.initializeJournal();
    }

    ngAfterViewChecked() {
        if (this.journalListService.logs.length !== this.previousJournalCount) {
            this.scrollToBottom(this.journalContainer);
            this.previousJournalCount = this.journalListService.logs.length;
        }
    }

    ngOnDestroy(): void {
        this.journalListService.cleanup();
    }

    private scrollToBottom(container: ElementRef): void {
        if (container) {
            const elem = container.nativeElement;
            elem.scrollTop = elem.scrollHeight;
        }
    }
}
