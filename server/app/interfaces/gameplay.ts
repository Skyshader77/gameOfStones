import { Map } from '@app/model/database/map';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { Subject, Subscription } from 'rxjs';
import { Fight as FightInterface } from '@common/interfaces/fight';
import { Player } from './player';

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

export interface GameStats {
    timeTaken: Date;
    percentageDoorsUsed: number;
    numberOfPlayersWithFlag: number;
    highestPercentageOfMapVisited: number;
}

export const ESCAPE_PROBABILITY = 0.4;

export interface GameTimer {
    timerId: NodeJS.Timer;
    counter: number;
    timerSubject: Subject<number>;
    timerSubscription: Subscription;
    isTurnChange: false;
}

export interface GameEndOutput {
    hasGameEnded: boolean;
    winningPlayerName: string;
}

export interface Fight extends Omit<FightInterface, 'fighters'> {
    fighters: Player[];
    hasPendingAction: boolean;
    timer: GameTimer;
}
