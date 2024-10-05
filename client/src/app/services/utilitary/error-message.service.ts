import { Injectable } from '@angular/core';
import { ErrorMessage } from '@app/interfaces/error';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ErrorMessageService {
    private messageSubject = new BehaviorSubject<ErrorMessage | null>(null);

    get message$(): Observable<ErrorMessage | null> {
        return this.messageSubject.asObservable();
    }

    set message(message: ErrorMessage) {
        this.messageSubject.next(message);
    }
}
