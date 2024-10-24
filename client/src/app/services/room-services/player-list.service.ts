import { Injectable } from '@angular/core';
import { Gateway } from '@common/interfaces/gateway.constants';
import { Router } from '@angular/router';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { Player, PlayerInfo } from '@app/interfaces/player';
import { SocketService } from '@app/services/communication-services/socket.service';
import { Subscription } from 'rxjs';
import { MyPlayerService } from './my-player.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerListService {
    playerList: PlayerInfo[];

    constructor(
        private socketService: SocketService,
        private myPlayerService: MyPlayerService,
        private router: Router,
    ) {}

    listenPlayerList(): Subscription {
        return this.socketService.on<Player[]>(Gateway.ROOM, RoomEvents.PLAYER_LIST).subscribe((players) => {
            // TODO check instead that you are not in the list
            if (!players.find((roomPlayer) => roomPlayer.playerInfo.userName === this.myPlayerService.myPlayer.playerInfo.userName)) {
                this.router.navigate(['/init']);
            } else {
                this.playerList = players.map((player) => player.playerInfo);
            }
        });
    }

    fetchPlayers(roomId: string): void {
        this.socketService.emit(Gateway.ROOM, RoomEvents.FETCH_PLAYERS, { roomId });
    }

    removePlayer(userName: string): void {
        this.playerList = this.playerList.filter((player) => player.userName !== userName);
        this.socketService.emit<string>(Gateway.ROOM, RoomEvents.DESIRE_KICK_PLAYER, userName);
    }
}
