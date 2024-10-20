import { Injectable } from '@nestjs/common';
import { setInterval } from 'timers';
import { FIGHT_NO_EVASION_TIME_S, FIGHT_WITH_EVASION_TIME_S, TIMER_RESOLUTION_MS, TURN_TIME_S } from './game-time.service.constants';
import { Observable, Subject } from 'rxjs';

// TODO
// This service only works for a single room.
// All the attributes will need to be in the service that stores the rooms.
@Injectable()
export class GameTimeService {
    private timerId: NodeJS.Timer;
    private turnCounter: number;
    private fightCounter: number;
    private timerSubject: Subject<number>;

    // TODO
    // adapt this to fetch from the right room only.
    getRoomTimerSubject(): Observable<number> {
        return this.timerSubject.asObservable();
    }

    // TODO when the timer will be in a Room object, it will be possible to refactor
    // these two functions into one
    startTurnTimer() {
        this.turnCounter = TURN_TIME_S;
        if (this.timerId) {
            this.stopTimer();
        }
        this.timerId = setInterval(() => {
            if (this.turnCounter > 0) {
                this.turnCounter--;
                this.timerSubject.next(this.turnCounter);
            }
        }, TIMER_RESOLUTION_MS);
    }

    startFightTurnTimer(hasEvasions: boolean) {
        this.fightCounter = hasEvasions ? FIGHT_WITH_EVASION_TIME_S : FIGHT_NO_EVASION_TIME_S;
        if (this.timerId) {
            this.stopTimer();
        }
        this.timerId = setInterval(() => {
            if (this.fightCounter > 0) {
                this.fightCounter--;
                this.timerSubject.next(this.fightCounter);
            }
        }, TIMER_RESOLUTION_MS);
    }

    private stopTimer() {
        clearInterval(this.timerId);
    }
}
