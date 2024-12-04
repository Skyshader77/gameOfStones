import { Injectable } from '@nestjs/common';
import { INITIAL_TIMER, TIMER_RESOLUTION_MS, TimerDuration } from '@app/constants/time.constants';
import { Observable, Subject } from 'rxjs';
import { GameTimer } from '@app/interfaces/gameplay';

@Injectable()
export class GameTimeService {
    getInitialTimer(): GameTimer {
        const timer = JSON.parse(JSON.stringify(INITIAL_TIMER));
        timer.timerSubject = new Subject<number>();
        return timer;
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
        timer.timerSubject.next(timer.counter);
        timer.timerId = setInterval(() => {
            if (timer.counter > 0) {
                timer.counter--;
                timer.timerSubject.next(timer.counter);
            }
        }, TIMER_RESOLUTION_MS);
    }

    stopTimer(timer: GameTimer) {
        clearInterval(timer.timerId);
        timer.timerId = null;
    }
}
