import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { CommonModule } from '@angular/common';
import { MEDIUM_ALERT, MEDIUM_COLOR, OK_COLOR, WARNING_ALERT, WARNING_COLOR } from '@app/constants/timer.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { FightStateService } from '@app/services/room-services/fight-state.service';

@Component({
    selector: 'app-game-timer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './game-timer.component.html',
})
export class GameTimerComponent implements OnInit, OnDestroy {
    constructor(
        private gameTimeService: GameTimeService,
        private gameSocketService: GameLogicSocketService,
        private playerListService: PlayerListService,
        private myPlayerService: MyPlayerService,
        private fightService: FightStateService,
    ) {}

    get currentTime(): string {
        return this.fightService.isFighting && !this.myPlayerService.isFighting ? '--' : this.gameTimeService.getRemainingTime().toString();
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

    getNextPlayer(): string | undefined {
        return this.playerListService.getCurrentPlayer()?.playerInfo.userName;
    }

    canPrintNextPlayer() {
        return this.gameSocketService.isChangingTurn;
    }

    ngOnInit() {
        this.gameTimeService.initialize();
    }

    ngOnDestroy() {
        this.gameTimeService.cleanup();
    }
}
