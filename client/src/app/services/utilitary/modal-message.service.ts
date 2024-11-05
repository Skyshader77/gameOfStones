import { Injectable } from '@angular/core';
import { ModalMessage } from '@app/interfaces/modal-message';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ModalMessageService {
    private messageSubject = new Subject<ModalMessage>();
    private decisionMessageSubject = new Subject<ModalMessage>();
    private storedMessage: ModalMessage | null;

    get message$(): Observable<ModalMessage> {
        return this.messageSubject.asObservable();
    }

    get decisionMessage$(): Observable<ModalMessage> {
        return this.decisionMessageSubject.asObservable();
    }

    showMessage(message: ModalMessage) {
        this.messageSubject.next(message);
    }

    showDecisionMessage(message: ModalMessage) {
        this.decisionMessageSubject.next(message);
    }

    setMessage(message: ModalMessage | null) {
        this.storedMessage = message;
    }

    getStoredMessage(): ModalMessage | null {
        return this.storedMessage ? this.storedMessage : null;
    }
}
