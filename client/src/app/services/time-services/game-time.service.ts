import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/communication-services/socket.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/interfaces/sockets.events/game.events';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameTimeService {
    private counter: number;

    constructor(private socketService: SocketService) {}

    getRemainingTime(): number {
        return this.counter;
    }

    isTimeOver(): boolean {
        return this.counter === 0;
    }

    initialize(initialCounter: number) {
        this.counter = initialCounter;
    }

    listenToRemainingTime(): Subscription {
        return this.socketService.on<number>(Gateway.GAME, GameEvents.RemainingTime).subscribe((counter: number) => {
            this.counter = counter;
        });
    }
}
