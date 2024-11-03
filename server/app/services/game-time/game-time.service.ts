import { Injectable } from '@nestjs/common';
import { setInterval } from 'timers';
import {
    CHANGE_TURN_TIME_S,
    FIGHT_NO_EVASION_TIME_S,
    FIGHT_WITH_EVASION_TIME_S,
    TIMER_RESOLUTION_MS,
    TURN_TIME_S,
} from './game-time.service.constants';
import { Observable, Subject } from 'rxjs';
import { GameTimer } from '@app/interfaces/gameplay';

@Injectable()
export class GameTimeService {
    getInitialTimer() {
        return {
            timerId: null,
            counter: 0,
            isTurnChange: false,
            timerSubject: new Subject<number>(),
            timerSubscription: null,
        };
    }

    getGameTimerSubject(timer: GameTimer): Observable<number> {
        return timer.timerSubject.asObservable();
    }

    startTurnTimer(timer: GameTimer, isTurnChange: boolean) {
        timer.isTurnChange = isTurnChange;
        timer.counter = isTurnChange ? CHANGE_TURN_TIME_S : TURN_TIME_S;
        this.resumeTurnTimer(timer);
    }

    startFightTurnTimer(timer: GameTimer, hasEvasions: boolean) {
        timer.counter = hasEvasions ? FIGHT_WITH_EVASION_TIME_S : FIGHT_NO_EVASION_TIME_S;
        this.resumeFightTurnTimer(timer);
    }

    resumeTurnTimer(timer: GameTimer) {
        if (timer.timerId) {
            this.stopTimer(timer);
        }
        timer.timerId = setInterval(() => {
            if (timer.counter > 0) {
                timer.counter--;
                timer.timerSubject.next(timer.counter);
            }
        }, TIMER_RESOLUTION_MS);
    }

    resumeFightTurnTimer(timer: GameTimer) {
        if (timer.timerId) {
            this.stopTimer(timer);
        }
        timer.timerId = setInterval(() => {
            if (timer.counter > 0) {
                timer.counter--;
                timer.timerSubject.next(timer.counter);
            }
        }, TIMER_RESOLUTION_MS);
    }

    stopTimer(timer: GameTimer) {
        clearInterval(timer.timerId);
    }
}
