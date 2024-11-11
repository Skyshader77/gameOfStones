import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DECIMAL_PRECISION, PERCENTAGE_MULTIPLIER, PLAYER_STATS_COLUMNS, PlayerStatsColumns } from '@app/constants/game-stats.constants';
import { GameStatsStateService } from '@app/services/game-stats-state/game-stats-state.service';
import { PlayerEndStats } from '@common/interfaces/end-statistics';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-stats-player-list',
    standalone: true,
    imports: [CommonModule, FormsModule, FontAwesomeModule],
    templateUrl: './stats-player-list.component.html',
})
export class StatsPlayerListComponent {
    circleInfoIcon = faCircleInfo;
    playerStatsColumns = PLAYER_STATS_COLUMNS;
    percentageMultiplier = PERCENTAGE_MULTIPLIER;
    decimalPrecision = DECIMAL_PRECISION;

    sortAscending = true;
    selectedColumn: keyof PlayerEndStats = PlayerStatsColumns.FightCount;

    constructor(private gameStatsStateService: GameStatsStateService) {
        this.sortPlayers();
    }

    get playerEndStats() {
        return this.gameStatsStateService.gameStats.playerStats;
    }

    sortPlayers() {
        const direction = this.sortAscending ? 1 : -1;
        this.playerEndStats.sort((playerA, playerB) => (playerA[this.selectedColumn] > playerB[this.selectedColumn] ? 1 : -1) * direction);
        this.sortAscending = !this.sortAscending;
    }

    getPlayerStats(player: PlayerEndStats): (string | number)[] {
        return Object.values(player);
    }
}
