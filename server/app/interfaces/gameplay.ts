import { Map } from '@app/model/database/map';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Subject, Subscription } from 'rxjs';

export interface Game {
    map: Map;
    winner: number;
    mode: GameMode;
    currentPlayer: string;
    actionsLeft: number;
    hasPendingAction: boolean;
    status: GameStatus;
    stats: GameStats;
    timer: GameTimer;
    isDebugMode: boolean;
}

export interface GameStats {
    timeTaken: Date;
    percentageDoorsUsed: number;
    numberOfPlayersWithFlag: number;
    highestPercentageOfMapVisited: number;
}

export interface GameTimer {
    timerId: NodeJS.Timer;
    turnCounter: number;
    fightCounter: number;
    isTurnChange: boolean;
    timerSubject: Subject<number>;
    timerSubscription: Subscription;
}

export interface GameEndOutput {
    hasGameEnded: boolean;
    winningPlayerName: string;
}
