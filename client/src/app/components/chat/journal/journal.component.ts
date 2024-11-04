import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { FormsModule } from '@angular/forms';
import { JournalLog } from '@common/interfaces/message';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

@Component({
    selector: 'app-journal',
    standalone: true,
    imports: [DatePipe, FormsModule],
    templateUrl: './journal.component.html',
    styleUrls: [],
})
export class JournalComponent implements AfterViewChecked {
    @ViewChild('journalContainer') journalContainer!: ElementRef;

    onlyMyLogs: boolean = false;

    private previousJournalCount = 0;

    constructor(
        private journalListService: JournalListService,
        private myPlayerService: MyPlayerService,
    ) {}

    get logs() {
        return this.journalListService.logs;
    }

    // ngOnInit() {
    //     this.journalListService.initializeJournal();
    // }

    ngAfterViewChecked() {
        if (this.journalListService.logs.length !== this.previousJournalCount) {
            this.scrollToBottom(this.journalContainer);
            this.previousJournalCount = this.journalListService.logs.length;
        }
    }

    // ngOnDestroy(): void {
    //     this.journalListService.cleanup();
    // }

    shouldDiplayLog(log: JournalLog): boolean {
        return !this.onlyMyLogs || log.players.includes(this.myPlayerService.getUserName());
    }

    private scrollToBottom(container: ElementRef): void {
        if (container) {
            const elem = container.nativeElement;
            elem.scrollTop = elem.scrollHeight;
        }
    }
}
