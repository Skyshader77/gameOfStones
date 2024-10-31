import { Injectable } from '@angular/core';
import { MessagingSocketService } from '@app/services/communication-services/messaging-socket.service';
import { JournalLog } from '@common/interfaces/message';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class JournalListService {
    private journalLogs: JournalLog[] = [];

    private journalSubscription: Subscription;

    constructor(private chatSocketService: MessagingSocketService) {}

    get logs() {
        return this.journalLogs;
    }

    initializeJournal() {
        this.cleanup();

        this.journalLogs = [];

        this.journalSubscription = this.chatSocketService.listenToJournal().subscribe((log: JournalLog) => {
            this.journalLogs.push(log);
        });
    }

    cleanup() {
        if (this.journalSubscription) {
            this.journalSubscription.unsubscribe();
        }
    }
}
