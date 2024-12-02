import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    DISABLED_MESSAGE,
    MAX_COUNTDOWN_PERCENTAGE,
    MAX_TIME,
    MEDIUM_ALERT,
    MEDIUM_COLOR,
    MILLI_PER_SECONDS,
    OK_COLOR,
    WARNING_ALERT,
    WARNING_COLOR,
} from '@app/constants/timer.constants';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';

@Component({
    selector: 'app-game-timer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './game-timer.component.html',
})
export class GameTimerComponent implements OnInit, OnDestroy {
    countdownPercentage: number = MAX_COUNTDOWN_PERCENTAGE;

    constructor(
        private gameTimeService: GameTimeService,
        private fightService: FightStateService,
        private myPlayerService: MyPlayerService,
    ) {}

    get currentTime(): string {
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
        this.gameTimeService.initialize();

        this.updateCountdown();
    }

    ngOnDestroy() {
        this.gameTimeService.cleanup();
    }

    updateCountdown() {
        setInterval(() => {
            const timeLeft = this.gameTimeService.getRemainingTime();
            this.countdownPercentage = (timeLeft / MAX_TIME) * MAX_COUNTDOWN_PERCENTAGE;
        }, MILLI_PER_SECONDS);
    }
}
