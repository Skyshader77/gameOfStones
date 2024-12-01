import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DISABLED_MESSAGE, MEDIUM_ALERT, MEDIUM_COLOR, OK_COLOR, WARNING_ALERT, WARNING_COLOR } from '@app/constants/timer.constants';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';

@Component({
    selector: 'app-game-timer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './game-timer.component.html',
    styleUrls: ['./game-timer.component.scss'],
})
export class GameTimerComponent implements OnInit, OnDestroy {
    countdownPercentage: number = 100;

    constructor(
        private gameTimeService: GameTimeService,
        private fightService: FightStateService,
        private myPlayerService: MyPlayerService,
    ) {}

    get currentTime(): string {
        // Get remaining time from the gameTimeService
        const timeLeft = this.gameTimeService.getRemainingTime();
        return this.fightService.isFighting && !this.myPlayerService.isFighting ? DISABLED_MESSAGE : '' + timeLeft;
    }

    get textColor(): string {
        const timeLeft = this.gameTimeService.getRemainingTime();
        if (timeLeft <= WARNING_ALERT) {
            return WARNING_COLOR;
        } else if (timeLeft <= MEDIUM_ALERT) {
            return MEDIUM_COLOR;
        } else {
            return OK_COLOR;
        }
    }

    ngOnInit() {
        // Initialize the game timer
        this.gameTimeService.initialize();

        // Update radial progress every second
        this.updateCountdown();
    }

    ngOnDestroy() {
        this.gameTimeService.cleanup();
    }

    updateCountdown() {
        // Update the radial progress value based on the remaining time
        setInterval(() => {
            const timeLeft = this.gameTimeService.getRemainingTime();
            const totalTime = 30;
            this.countdownPercentage = (timeLeft / totalTime) * 100;
        }, 1000); // Update every second
    }
}
