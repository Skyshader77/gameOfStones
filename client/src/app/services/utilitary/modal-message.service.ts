import { Injectable } from '@angular/core';
import { ModalMessage } from '@app/interfaces/modal-message';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ModalMessageService {
    private messageSubject = new Subject<ModalMessage>();

    get message$(): Observable<ModalMessage> {
        return this.messageSubject.asObservable();
    }

    showMessage(message: ModalMessage) {
        this.messageSubject.next(message);
    }
}
