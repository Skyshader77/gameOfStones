import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DiceService {
    rollDice$;
    private rollDiceSubject = new Subject<number>();

    constructor() {
        this.rollDice$ = this.rollDiceSubject.asObservable();
    }

    triggerRollDice(roll: number) {
        this.rollDiceSubject.next(roll);
    }
}
