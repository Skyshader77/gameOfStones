import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PERCENTAGE_MULTIPLIER, PLAYER_STATS_COLUMNS, PlayerStatsColumns } from '@app/constants/game-stats.constants';
import { GameStatsStateService } from '@app/services/states/game-stats-state/game-stats-state.service';
import { PlayerEndStats } from '@common/interfaces/end-statistics';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-stats-player-list',
    standalone: true,
    imports: [CommonModule, FormsModule, FontAwesomeModule],
    templateUrl: './stats-player-list.component.html',
})
export class StatsPlayerListComponent implements OnInit {
    circleInfoIcon = faCircleInfo;
    playerStatsColumns = PLAYER_STATS_COLUMNS;
    percentageMultiplier = PERCENTAGE_MULTIPLIER;

    sortDescending = false;
    selectedColumn: keyof PlayerEndStats = PlayerStatsColumns.FightCount;

    constructor(private gameStatsStateService: GameStatsStateService) {}

    get playerEndStats() {
        return this.gameStatsStateService.gameStats?.playerStats;
    }

    ngOnInit(): void {
        this.sortColumn(this.selectedColumn, this.sortDescending);
    }

    sortColumn(columnKey: keyof PlayerEndStats, ascending: boolean) {
        this.selectedColumn = columnKey;
        this.sortDescending = ascending;
        const direction = ascending ? -1 : 1;
        this.gameStatsStateService.gameStats?.playerStats.sort((playerA, playerB) => {
            if (playerA[columnKey] < playerB[columnKey]) {
                return -1 * direction;
            }
            if (playerA[columnKey] > playerB[columnKey]) {
                return 1 * direction;
            }
            return 0;
        });
    }

    getPlayerStats(player: PlayerEndStats): { value: string | number; index: number }[] {
        return Object.values(player).map((value, index) => ({ value, index }));
    }
}
