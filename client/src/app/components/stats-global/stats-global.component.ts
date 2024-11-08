import { Component } from '@angular/core';
import { SECONDS_PER_MINUTE } from '@app/constants/timer.constants';
import { GameStatsStateService } from '@app/services/game-stats-state/game-stats-state.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
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
            value: this.percentageDoorsManipulated || '--',
        },
        {
            key: 'playersWithFlag',
            label: 'Joueurs ayant détenu le drapeau',
            description: 'Le nombre de joueurs différents ayant détenu le drapeau durant la partie',
            value: this.playerWithFlag,
            showIf: 'ctfMode',
        },
    ];

    private readonly zeroThreshold = 10;

    constructor(
        private gameStatsStateService: GameStatsStateService,
        private gameMapService: GameMapService,
    ) {}

    get gameTime() {
        return this.gameStatsStateService.gameStats.timeTaken;
    }

    get totalTurn() {
        return this.gameStatsStateService.gameStats.turnCount;
    }

    get percentageVisitedTiles() {
        return this.gameStatsStateService.gameStats.percentageTilesTraversed;
    }

    get percentageDoorsManipulated(): number | null {
        return this.gameStatsStateService.gameStats.percentageDoorsUsed;
    }

    get playerWithFlag() {
        return this.gameStatsStateService.gameStats.numberOfPlayersWithFlag;
    }

    get isCTF() {
        return this.gameMapService.map.mode === GameMode.CTF;
    }

    getFormattedTime(): string {
        const totalSeconds = this.gameTime;
        const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
        const seconds = totalSeconds - minutes * SECONDS_PER_MINUTE;
        return `${this.padWithZero(minutes)}:${this.padWithZero(seconds)}`;
    }

    private padWithZero(value: number): string {
        return value < this.zeroThreshold ? '0' + value : value.toString();
    }
}
