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
    constructor(
        private gameTimeService: GameTimeService,
        private fightService: FightStateService,
        private myPlayerService: MyPlayerService,
    ) {}

    get currentTime(): string {
        return this.fightService.isFighting && !this.myPlayerService.isFighting ? DISABLED_MESSAGE : '' + this.gameTimeService.getRemainingTime();
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
    }

    ngOnDestroy() {
        this.gameTimeService.cleanup();
    }
}
