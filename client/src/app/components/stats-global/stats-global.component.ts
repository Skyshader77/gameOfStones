import { Component } from '@angular/core';
import { GameMode } from '@common/enums/game-mode.enum';
import { GlobalStatsColumns } from '@common/interfaces/end-statistics';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-stats-global',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './stats-global.component.html',
    styleUrl: './stats-global.component.scss',
})
export class StatsGlobalComponent {
    circleInfoIcon = faCircleInfo;

    gameTime = 0; // en seconde
    totalTurn = 0; // somme des tours de tous les joueurs
    percentageVisitedTiles = 0;
    doorsManipulatedPercentage = 0;
    playersWithFlag = 0;

    gameMode = GameMode.CTF; // juste pour tester l'affichage
    ctfMode = GameMode.CTF;

    globalStatsColumns: GlobalStatsColumns[] = [
        {
            key: 'duration',
            label: 'Durée de la partie',
            description: 'Durée totale de la partie, formatée en minutes et secondes (MM:SS)',
            value: this.getFormattedTime(),
        },
        {
            key: 'totalTurns',
            label: 'Nombre de tours de jeu',
            description: 'Somme des tours de jeu effectués par tous les joueurs',
            value: this.totalTurn,
        },
        {
            key: 'percentageVisitedTiles',
            label: '% des tuiles de terrain visitées',
            description: 'Pourcentage des tuiles de terrain ayant été visitées par au moins un joueur durant la partie',
            value: this.percentageVisitedTiles,
        },
        {
            key: 'doorsManipulatedPercentage',
            label: '% des portes ayant été manipulées',
            description: 'Pourcentage des portes ayant été manipulées au moins une fois durant la partie',
            value: this.doorsManipulatedPercentage,
        },
        {
            key: 'playersWithFlag',
            label: 'Joueurs ayant détenu le drapeau',
            description: 'Le nombre de joueurs différents ayant détenu le drapeau durant la partie',
            value: this.playersWithFlag,
            showIf: 'ctfMode',
        },
    ];

    private readonly secondsInMinute = 60;
    private readonly zeroThreshold = 10;

    getFormattedTime(): string {
        const minutes = Math.floor(this.gameTime / this.secondsInMinute);
        const seconds = this.gameTime % this.secondsInMinute;
        return `${this.padWithZero(minutes)}:${this.padWithZero(seconds)}`;
    }

    private padWithZero(value: number): string {
        return value < this.zeroThreshold ? '0' + value : value.toString();
    }
}
