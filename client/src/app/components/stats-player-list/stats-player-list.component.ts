import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayerEndStats, PlayerStatsColumns } from '@common/interfaces/end-statistics';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-stats-player-list',
    standalone: true,
    imports: [CommonModule, FormsModule, FontAwesomeModule],
    templateUrl: './stats-player-list.component.html',
    styleUrls: ['./stats-player-list.component.scss'],
})
export class StatsPlayerListComponent implements OnInit {
    playerEndStats: PlayerEndStats[] = [
        {
            name: 'Joueur 1',
            fightCount: 10,
            evasionCount: 5,
            winCount: 7,
            lossCount: 3,
            totalHpLost: 50,
            totalDamageDealt: 30,
            itemCount: 12,
            percentageTilesTraversed: 80,
        },
        {
            name: 'Joueur 2',
            fightCount: 8,
            evasionCount: 6,
            winCount: 5,
            lossCount: 4,
            totalHpLost: 40,
            totalDamageDealt: 25,
            itemCount: 9,
            percentageTilesTraversed: 60,
        },
        {
            name: 'Joueur 3',
            fightCount: 12,
            evasionCount: 3,
            winCount: 10,
            lossCount: 2,
            totalHpLost: 60,
            totalDamageDealt: 35,
            itemCount: 15,
            percentageTilesTraversed: 90,
        },
        {
            name: 'Joueur 4',
            fightCount: 9,
            evasionCount: 4,
            winCount: 6,
            lossCount: 5,
            totalHpLost: 55,
            totalDamageDealt: 28,
            itemCount: 11,
            percentageTilesTraversed: 75,
        },
        {
            name: 'Joueur 5',
            fightCount: 15,
            evasionCount: 2,
            winCount: 12,
            lossCount: 1,
            totalHpLost: 70,
            totalDamageDealt: 40,
            itemCount: 16,
            percentageTilesTraversed: 85,
        },
    ];

    playerStatsColumns: PlayerStatsColumns[] = [
        {
            key: 'fightCount',
            label: 'Combats',
            description: 'Indique le nombre total de combats auxquels un joueur a participé, qu’ils soient gagnés ou perdus',
        },
        {
            key: 'evasionCount',
            label: 'Évasions',
            description: 'Indique le nombre de fois qu’un joueur a réussi à fuir un affrontement',
        },
        {
            key: 'winCount',
            label: 'Victoires',
            description: 'Indique le nombre de fois qu’un joueur a remporté un combat',
        },
        {
            key: 'lossCount',
            label: 'Défaites',
            description: 'Indique le nombre de fois qu’un joueur a perdu un combat',
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
            description: 'Indique le nombre total d’objets différents collectés par le joueur pendant la partie',
        },
        {
            key: 'percentageTilesTraversed',
            label: 'Tuiles visitées',
            description: 'Indique le pourcentage des tuiles de terrain visitées par le joueur dans le jeu',
        },
    ];

    circleInfoIcon = faCircleInfo;
    sortAscending = true;
    selectedColumn: keyof PlayerEndStats = 'fightCount';

    ngOnInit(): void {
        this.sortPlayers();
    }

    getPlayerStats(player: PlayerEndStats): (string | number)[] {
        return Object.values(player);
    }

    sortPlayers() {
        const direction = this.sortAscending ? 1 : -1;
        this.playerEndStats.sort((playerA, playerB) => {
            return (playerA[this.selectedColumn] > playerB[this.selectedColumn] ? 1 : -1) * direction;
        });
        this.sortAscending = !this.sortAscending;
    }

    sortColumn(columnKey: keyof PlayerEndStats, ascending: boolean) {
        this.selectedColumn = columnKey;
        this.sortAscending = ascending;
        const direction = ascending ? 1 : -1;
        this.playerEndStats.sort((playerA, playerB) => {
            return (playerA[columnKey] > playerB[columnKey] ? 1 : -1) * direction;
        });
    }
}
