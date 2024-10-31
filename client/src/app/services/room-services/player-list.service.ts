import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { Gateway } from '@common/constants/gateway.constants';
import { Player, PlayerInfo } from '@app/interfaces/player';
import { SocketService } from '@app/services/communication-services/socket.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { MyPlayerService } from './my-player.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { KICKED_PLAYER_MESSAGE, ROOM_CLOSED_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerListService {
    playerList: PlayerInfo[];
    private removalConfirmationSubject = new Subject<string>();

    constructor(
        private socketService: SocketService,
        private roomSocketService: RoomSocketService,
        private myPlayerService: MyPlayerService,
        private router: Router,
        private modalMessageService: ModalMessageService,
    ) {}

    get removalConfirmation$(): Observable<string> {
        return this.removalConfirmationSubject.asObservable();
    }

    listenPlayerListUpdated(): Subscription {
        return this.socketService.on<Player[]>(Gateway.ROOM, RoomEvents.PlayerList).subscribe((players) => {
            this.playerList = players.map((player) => player.playerInfo);
        });
    }

    listenPlayerAdded(): Subscription {
        return this.socketService.on<Player>(Gateway.ROOM, RoomEvents.AddPlayer).subscribe((player) => {
            this.playerList.push(player.playerInfo);
        });
    }

    listenPlayerRemoved(): Subscription {
        return this.socketService.on<string>(Gateway.ROOM, RoomEvents.RemovePlayer).subscribe((playerName) => {
            if (playerName === this.myPlayerService.getUserName()) {
                this.modalMessageService.setMessage(KICKED_PLAYER_MESSAGE);
                this.router.navigate(['/init']);
            }
            this.playerList = this.playerList.filter((existingPlayer) => existingPlayer.userName !== playerName);
        });
    }

    listenRoomClosed(): Subscription {
        return this.socketService.on<void>(Gateway.ROOM, RoomEvents.RoomClosed).subscribe(() => {
            this.modalMessageService.setMessage(ROOM_CLOSED_MESSAGE);
            this.router.navigate(['/init']);
        });
    }

    askPlayerRemovalConfirmation(userName: string): void {
        this.removalConfirmationSubject.next(userName);
    }

    removePlayer(playerName: string): void {
        this.roomSocketService.removePlayer(playerName);
    }
}
