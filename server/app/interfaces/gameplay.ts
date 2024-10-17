import { Map } from '@app/model/database/map';
import { PlayerStatus } from '@common/interfaces/player.constants';
import { GameMode } from './gamemode';
import { Player } from './player';

export class Game {
    map: Map;
    players: Player[];
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

export interface AttackResult{
    playerId:string,
    remainingHp:number,
    hasFightEnded:boolean,
}

export const ESCAPE_PROBABILITY=0.4;