import { Injectable } from '@angular/core';
import { ModalMessage } from '@app/interfaces/modal-message';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ModalMessageService {
    private messageSubject = new Subject<ModalMessage>();
    private storedMessage: ModalMessage | null;

    get message$(): Observable<ModalMessage> {
        return this.messageSubject.asObservable();
    }

    showMessage(message: ModalMessage) {
        this.messageSubject.next(message);
    }

    setMessage(message: ModalMessage) {
        this.storedMessage = message;
    }

    getStoredMessage(): ModalMessage | null {
        return this.storedMessage;
    }
}
