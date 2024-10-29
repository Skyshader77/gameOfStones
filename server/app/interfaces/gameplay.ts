import { Map } from '@app/model/database/map';
import { PlayerStatus } from '@common/constants/player.constants';
import { ReachableTile } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMode } from '@common/enums/game-mode.enum';
import { Subject, Subscription } from 'rxjs';

export class Game {
    map: Map;
    winner: number;
    mode: GameMode;
    currentPlayer: number;
    actionsLeft: number;
    playerStatus: PlayerStatus;
    stats: GameStats;
    timer: GameTimer;
    isDebugMode: boolean;
}

export class GameStats {
    timeTaken: Date;
    percentageDoorsUsed: number;
    numberOfPlayersWithFlag: number;
    highestPercentageOfMapVisited: number;
}

export interface GameTimer {
    timerId: NodeJS.Timer;
    turnCounter: number;
    fightCounter: number;
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

export interface GameEndOutput{
    hasGameEnded:boolean;
    winningPlayerName:string
}