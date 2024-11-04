import { Injectable } from '@angular/core';
import { MessagingSocketService } from '@app/services/communication-services/messaging-socket.service';
import { JournalLog } from '@common/interfaces/message';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class JournalListService {
    private journalLogs: JournalLog[];

    private journalSubscription: Subscription;

    constructor(private chatSocketService: MessagingSocketService) {
        this.startJournal();
    }

    get logs() {
        return this.journalLogs;
    }

    startJournal() {
        this.journalLogs = [];
    }

    initializeJournal() {
        this.cleanup();

        this.journalSubscription = this.chatSocketService.listenToJournal().subscribe((publicLog: JournalLog) => {
            this.journalLogs.push(publicLog);
        });
    }

    cleanup() {
        if (this.journalSubscription) {
            this.journalSubscription.unsubscribe();
        }
    }
}
