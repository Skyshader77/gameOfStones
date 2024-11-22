import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameTimeService {
    private counter: number = 0;
    private remainingTimeSubscription: Subscription;

    constructor(private socketService: SocketService) {}

    initialize() {
        this.remainingTimeSubscription = this.listenToRemainingTime();
    }

    getRemainingTime(): number {
        return this.counter;
    }

    isTimeOver(): boolean {
        return this.counter === 0;
    }

    setStartTime(initialCounter: number) {
        this.counter = initialCounter;
    }

    cleanup() {
        this.remainingTimeSubscription.unsubscribe();
    }

    private listenToRemainingTime(): Subscription {
        return this.socketService.on<number>(Gateway.Game, GameEvents.RemainingTime).subscribe((counter: number) => {
            this.counter = counter;
        });
    }
}
