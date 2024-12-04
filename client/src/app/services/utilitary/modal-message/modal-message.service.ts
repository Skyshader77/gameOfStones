import { Injectable } from '@angular/core';
import { ModalMessage } from '@app/interfaces/modal-message';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ModalMessageService {
    private messageSubject = new Subject<ModalMessage>();
    private decisionMessageSubject = new Subject<ModalMessage>();
    private inputMessageSubject = new Subject<string>();
    private storedMessage: ModalMessage | null;

    get message$(): Observable<ModalMessage> {
        return this.messageSubject.asObservable();
    }

    get decisionMessage$(): Observable<ModalMessage> {
        return this.decisionMessageSubject.asObservable();
    }

    get inputMessage$(): Observable<string> {
        return this.inputMessageSubject.asObservable();
    }

    showMessage(message: ModalMessage) {
        this.storedMessage = message;
        this.messageSubject.next(message);
    }

    showDecisionMessage(message: ModalMessage) {
        this.decisionMessageSubject.next(message);
    }

    showInputPrompt(message: ModalMessage) {
        this.messageSubject.next(message);
    }

    setMessage(message: ModalMessage | null) {
        this.storedMessage = message;
        if (message) {
            this.messageSubject.next(message);
        }
    }

    getStoredMessage(): ModalMessage | null {
        return this.storedMessage ? this.storedMessage : null;
    }

    emitUserInput(input: string) {
        this.inputMessageSubject.next(input);
    }

    clearMessage() {
        this.storedMessage = null;
    }
}
