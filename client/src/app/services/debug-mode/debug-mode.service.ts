import { inject, Injectable } from '@angular/core';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DebugModeService {
    private debug: boolean = false;
    private socketService = inject(SocketService);
    private gameLogicSocket = inject(GameLogicSocketService);
    private debugSubscription: Subscription;
    private myPlayerService = inject(MyPlayerService);

    initialize() {
        this.debugSubscription = this.listenToDebugMode();
    }

    cleanup() {
        this.debugSubscription.unsubscribe();
    }

    getDebug(): boolean {
        return this.debug;
    }

    toggleDebug() {
        if (this.myPlayerService.isOrganizer()) {
            this.socketService.emit(Gateway.Game, GameEvents.DesireDebugMode);
        }
    }

    teleport(destination: Vec2) {
        if (this.debug && !this.myPlayerService.isFighting) {
            this.socketService.emit(Gateway.Game, GameEvents.DesireTeleport, destination);
            this.gameLogicSocket.endAction();
        }
    }

    private listenToDebugMode(): Subscription {
        return this.socketService.on<boolean>(Gateway.Game, GameEvents.DebugMode).subscribe((debug) => {
            this.debug = debug;
        });
    }
}
