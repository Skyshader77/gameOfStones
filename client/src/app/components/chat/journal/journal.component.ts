import { DatePipe } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { JournalLog } from '@common/interfaces/message';

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
        private audioService: AudioService,
    ) {}

    get logs() {
        return this.journalListService.logs;
    }

    playClickSound() {
        this.audioService.playSfx(Sfx.ButtonClicked);
    }

    ngAfterViewChecked() {
        if (this.journalListService.logs.length !== this.previousJournalCount) {
            this.scrollToBottom(this.journalContainer);
            this.previousJournalCount = this.journalListService.logs.length;
        }
    }

    shouldDisplayLog(log: JournalLog): boolean {
        return !this.onlyMyLogs || log.players.includes(this.myPlayerService.getUserName());
    }

    private scrollToBottom(container: ElementRef): void {
        if (container) {
            const elem = container.nativeElement;
            elem.scrollTop = elem.scrollHeight;
        }
    }
}
