import { Injectable } from '@angular/core';
import { GameEndStats } from '@common/interfaces/end-statistics';

@Injectable({
    providedIn: 'root',
})
export class GameStatsStateService {
    gameStats: GameEndStats;
}
