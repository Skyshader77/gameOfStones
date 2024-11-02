import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameTimeService } from '@app/services/time-services/game-time.service';

@Component({
    selector: 'app-game-timer',
    standalone: true,
    imports: [],
    templateUrl: './game-timer.component.html',
})
export class GameTimerComponent implements OnInit, OnDestroy {
    constructor(private gameTimeService: GameTimeService) {}

    get currentTime(): number {
        return this.gameTimeService.getRemainingTime();
    }

    ngOnInit() {
        this.gameTimeService.initialize();
    }

    ngOnDestroy() {
        this.gameTimeService.cleanup();
    }
}
