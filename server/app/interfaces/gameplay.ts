import { Map } from '@app/model/database/map';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { Fight as FightInterface } from '@common/interfaces/fight';
import { Subject, Subscription } from 'rxjs';
import { Player } from '@common/interfaces/player';
import { GameStats } from './statistics';

export interface Game {
    map: Map;
    winner: string;
    mode: GameMode;
    currentPlayer: string;
    hasPendingAction: boolean;
    status: GameStatus;
    stats: GameStats;
    timer: GameTimer;
    isTurnChange: boolean;
    isDebugMode: boolean;
    fight?: Fight;
}

export interface GameTimer {
    timerId: NodeJS.Timer;
    counter: number;
    timerSubject: Subject<number>;
    timerSubscription: Subscription;
}

export interface Fight extends Omit<FightInterface, 'fighters'> {
    fighters: Player[];
    hasPendingAction: boolean;
    timer: GameTimer;
}
