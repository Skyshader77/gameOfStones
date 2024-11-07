import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PlayerEndStats } from '@common/interfaces/end-statistics';

@Component({
    selector: 'app-stats-player-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stats-player-list.component.html',
    styleUrl: './stats-player-list.component.scss',
})
export class StatsPlayerListComponent {
    players: PlayerEndStats[] = [
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
}
