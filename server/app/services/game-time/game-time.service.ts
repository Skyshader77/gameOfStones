import { Injectable } from '@nestjs/common';
import { setInterval } from 'timers';
import { TIMER_RESOLUTION_MS, TimerDuration } from '@app/constants/time.constants';
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

    getTimerSubject(timer: GameTimer): Observable<number> {
        return timer.timerSubject.asObservable();
    }

    startTimer(timer: GameTimer, type: TimerDuration) {
        timer.counter = type;
        this.resumeTimer(timer);
    }

    resumeTimer(timer: GameTimer) {
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
