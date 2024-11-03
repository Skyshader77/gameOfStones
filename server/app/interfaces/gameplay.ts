import { Map } from '@app/model/database/map';
import { GameMode } from '@common/enums/game-mode.enum';
import { ReachableTile } from '@common/interfaces/move';
import { GameStatus } from '@common/enums/game-status.enum';
import { Vec2 } from '@common/interfaces/vec2';
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

export interface MovementServiceOutput {
    optimalPath: ReachableTile;
    hasTripped: boolean;
}

export interface DijkstraServiceOutput {
    position: Vec2;
    displacementVector: Vec2[];
    remainingSpeed: number;
}

export interface GameEndOutput {
    hasGameEnded: boolean;
    winningPlayerName: string;
}
