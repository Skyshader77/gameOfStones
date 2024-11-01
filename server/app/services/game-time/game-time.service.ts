import { Injectable } from '@nestjs/common';
import { setInterval } from 'timers';
import {
    CHANGE_TURN_TIME_S,
    FIGHT_NO_EVASION_TIME_S,
    FIGHT_WITH_EVASION_TIME_S,
    TIMER_RESOLUTION_MS,
    TURN_TIME_S,
} from './game-time.service.constants';
import { Observable } from 'rxjs';
import { GameTimer } from '@app/interfaces/gameplay';

@Injectable()
export class GameTimeService {
    getGameTimerSubject(timer: GameTimer): Observable<number> {
        return timer.timerSubject.asObservable();
    }

    startTurnTimer(timer: GameTimer, isTurnChange: boolean) {
        timer.turnCounter = isTurnChange ? CHANGE_TURN_TIME_S : TURN_TIME_S;
        this.resumeTurnTimer(timer);
    }

    startFightTurnTimer(timer: GameTimer, hasEvasions: boolean) {
        timer.fightCounter = hasEvasions ? FIGHT_WITH_EVASION_TIME_S : FIGHT_NO_EVASION_TIME_S;
        this.resumeFightTurnTimer(timer);
    }

    resumeTurnTimer(timer: GameTimer) {
        if (timer.timerId) {
            this.stopTimer(timer);
        }
        timer.timerId = setInterval(() => {
            if (timer.turnCounter > 0) {
                timer.turnCounter--;
                timer.timerSubject.next(timer.turnCounter);
            }
        }, TIMER_RESOLUTION_MS);
    }

    resumeFightTurnTimer(timer: GameTimer) {
        if (timer.timerId) {
            this.stopTimer(timer);
        }
        timer.timerId = setInterval(() => {
            if (timer.fightCounter > 0) {
                timer.fightCounter--;
                timer.timerSubject.next(timer.fightCounter);
            }
        }, TIMER_RESOLUTION_MS);
    }

    private stopTimer(timer: GameTimer) {
        clearInterval(timer.timerId);
    }
}
