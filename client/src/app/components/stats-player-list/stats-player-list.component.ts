import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DECIMAL_PRECISION, PERCENTAGE_MULTIPLIER } from '@app/constants/player.constants';
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
export class StatsPlayerListComponent implements OnInit {
    playerStatsColumns = [
        {
            key: 'fightCount',
            label: 'Combats',
            description: "Indique le nombre total de combats auxquels un joueur a participé, qu'ils soient gagnés ou perdus",
        },
        {
            key: 'winCount',
            label: 'Victoires',
            description: "Indique le nombre de fois qu'un joueur a remporté un combat",
        },
        {
            key: 'lossCount',
            label: 'Défaites',
            description: "Indique le nombre de fois qu'un joueur a perdu un combat",
        },
        {
            key: 'evasionCount',
            label: 'Évasions',
            description: "Indique le nombre de fois qu'un joueur a réussi à fuir un affrontement",
        },
        {
            key: 'totalHpLost',
            label: 'Vie perdue',
            description: 'Indique le nombre total de points de vie perdus par le joueur dans les combats',
        },
        {
            key: 'totalDamageDealt',
            label: 'Dégâts',
            description: 'Indique le total des dégâts infligés par le joueur à ses adversaires',
        },
        {
            key: 'itemCount',
            label: 'Objets pris',
            description: "Indique le nombre total d'objets différents collectés par le joueur pendant la partie",
        },
        {
            key: 'percentageTilesTraversed',
            label: 'Tuiles visitées',
            description: 'Indique le pourcentage des tuiles de terrain visitées par le joueur dans le jeu',
        },
    ];

    circleInfoIcon = faCircleInfo;

    percentageMultiplier = PERCENTAGE_MULTIPLIER;
    decimalPrecision = DECIMAL_PRECISION;

    sortAscending = true;
    selectedColumn: keyof PlayerEndStats = 'fightCount';

    constructor(private gameStatsStateService: GameStatsStateService) {}

    get playerEndStats() {
        return this.gameStatsStateService.gameStats.playerStats;
    }

    ngOnInit(): void {
        this.sortPlayers();
    }

    getPlayerStats(player: PlayerEndStats): (string | number)[] {
        return Object.values(player);
    }

    sortPlayers() {
        const direction = this.sortAscending ? 1 : -1;
        this.gameStatsStateService.gameStats.playerStats.sort((playerA, playerB) => {
            return (playerA[this.selectedColumn] > playerB[this.selectedColumn] ? 1 : -1) * direction;
        });
        this.sortAscending = !this.sortAscending;
    }

    sortColumn(columnKey: keyof PlayerEndStats, ascending: boolean) {
        this.selectedColumn = columnKey;
        this.sortAscending = ascending;
        const direction = ascending ? 1 : -1;
        this.gameStatsStateService.gameStats.playerStats.sort((playerA, playerB) => {
            return (playerA[columnKey] > playerB[columnKey] ? 1 : -1) * direction;
        });
    }
}
