import { Map } from '@app/model/database/map';
import { PlayerStatus } from '@common/interfaces/player.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMode } from './game-mode';

export class Game {
    map: Map;
    winner: number;
    mode: GameMode;
    currentPlayer: string;
    actionsLeft: number;
    playerStatus: PlayerStatus;
    stats: GameStats;
    isDebugMode: boolean;
    timerValue: number;
}

export class GameStats {
    timeTaken: Date;
    percentageDoorsUsed: number;
    numberOfPlayersWithFlag: number;
    highestPercentageOfMapVisited: number;
}

export interface MovementServiceOutput {
    dijkstraServiceOutput: DijkstraServiceOutput;
    hasTripped: boolean;
}

export interface DijkstraServiceOutput {
    position: Vec2;
    displacementVector: Vec2[];
    remainingSpeed: number;
}
