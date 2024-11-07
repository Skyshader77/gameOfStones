import { Component } from '@angular/core';
import { GameMode } from '@common/enums/game-mode.enum';

@Component({
    selector: 'app-stats-global',
    standalone: true,
    imports: [],
    templateUrl: './stats-global.component.html',
    styleUrl: './stats-global.component.scss',
})
export class StatsGlobalComponent {
    gameTime = 0; // in second

    totalTurn = 0; // somme des tours de tous les joueurs

    percentageVisitedTiles = 0;

    doorsManipulatedPercentage = 0;

    ctfMode = GameMode.CTF;
    gameMode = GameMode.CTF;
    playersWithFlag = 0;

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
