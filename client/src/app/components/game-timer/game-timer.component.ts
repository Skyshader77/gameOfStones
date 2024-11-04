import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-game-timer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './game-timer.component.html',
})
export class GameTimerComponent implements OnInit, OnDestroy {
    private timeLeft: number;
    constructor(private gameTimeService: GameTimeService) {}

    get currentTime(): number {
        this.timeLeft = this.gameTimeService.getRemainingTime();
        return this.gameTimeService.getRemainingTime();
    }

    get textColor(): string {
        const alertColor = 20;
        const warningColor = 10;
        if (this.timeLeft > alertColor) {
            return 'text-green-500';
        } else if (this.timeLeft > warningColor) {
            return 'text-yellow-500';
        } else {
            return 'text-red-500';
        }
    }

    ngOnInit() {
        this.gameTimeService.initialize();
    }

    ngOnDestroy() {
        this.gameTimeService.cleanup();
    }
}
