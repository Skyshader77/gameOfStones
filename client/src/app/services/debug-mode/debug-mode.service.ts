import { inject, Injectable } from '@angular/core';
import { SocketService } from '@app/services/communication-services/socket.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
import { Vec2 } from '@common/interfaces/vec2';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { Subscription } from 'rxjs';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

@Injectable({
    providedIn: 'root',
})
export class DebugModeService {
    debug: boolean = false;
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

    activateDebug() {
        if (this.myPlayerService.isOrganizer()) {
            this.debug = !this.debug;
            this.socketService.emit(Gateway.ROOM, RoomEvents.DesireDebugMode);
        }
    }

    teleport(destination: Vec2) {
        if (this.debug && !this.myPlayerService.isFighting) {
            this.socketService.emit(Gateway.GAME, GameEvents.DesireTeleport, destination);
            this.gameLogicSocket.endAction();
        }
    }

    listenToDebugMode(): Subscription {
        return this.socketService.on<boolean>(Gateway.ROOM, RoomEvents.DebugMode).subscribe((debug) => {
            this.debug = debug;
        });
    }
}
