import { GameTimer } from '@app/interfaces/gameplay';
import { Subject } from 'rxjs';

export const TIMER_RESOLUTION_MS = 1000;

export const TURN_TIME_S = 30;
export const CHANGE_TURN_TIME_S = 3;
export const FIGHT_WITH_EVASION_TIME_S = 5;
export const FIGHT_NO_EVASION_TIME_S = 3;

export enum TimerDuration {
    GameTurn = TURN_TIME_S,
    GameTurnChange = CHANGE_TURN_TIME_S,
    FightTurnEvasion = FIGHT_WITH_EVASION_TIME_S,
    FightTurnNoEvasion = FIGHT_NO_EVASION_TIME_S,
}

export const INITIAL_TIMER: GameTimer = {
    timerId: null,
    counter: 0,
    isTurnChange: false,
    timerSubject: new Subject<number>(),
    timerSubscription: null,
};
