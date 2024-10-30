import { Injectable } from '@angular/core';
import { ChatSocketService } from '@app/services/communication-services/chat-socket.service';
import { JournalLog } from '@common/interfaces/message';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class JournalListService {
    private journalLogs: JournalLog[] = [];

    private journalSubscription: Subscription;

    constructor(private chatSocketService: ChatSocketService) {}

    get logs() {
        return this.journalLogs;
    }

    initializeJournal() {
        this.cleanup();

        this.journalLogs = [];

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
