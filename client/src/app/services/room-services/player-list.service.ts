import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { Gateway } from '@common/constants/gateway.constants';
import { Player } from '@app/interfaces/player';
import { SocketService } from '@app/services/communication-services/socket.service';
import { Subscription } from 'rxjs';
import { MyPlayerService } from './my-player.service';
import { PlayerStartPosition } from '@common/interfaces/game-start-info';

@Injectable({
    providedIn: 'root',
})
export class PlayerListService {
    playerList: Player[];

    constructor(
        private socketService: SocketService,
        private myPlayerService: MyPlayerService,
        private router: Router,
    ) {}

    listenPlayerList(): Subscription {
        return this.socketService.on<Player[]>(Gateway.ROOM, RoomEvents.PLAYER_LIST).subscribe((players) => {
            if (!players.find((roomPlayer) => roomPlayer.playerInfo.userName === this.myPlayerService.myPlayer.playerInfo.userName)) {
                this.router.navigate(['/init']);
            } else {
                this.playerList = players;
            }
        });
    }

    fetchPlayers(roomId: string): void {
        this.socketService.emit(Gateway.ROOM, RoomEvents.FETCH_PLAYERS, { roomId });
    }

    removePlayer(userName: string): void {
        this.playerList = this.playerList.filter((player) => player.playerInfo.userName !== userName);
        this.socketService.emit<string>(Gateway.ROOM, RoomEvents.DESIRE_KICK_PLAYER, userName);
    }

    preparePlayersForGameStart(gameStartInformation: PlayerStartPosition[]) {
        const newPlayerList: Player[] = [];

        gameStartInformation.forEach((info) => {
            const player = this.playerList.find((listPlayer) => listPlayer.playerInfo.userName === info.userName);
            if (player) {
                player.playerInGame.startPosition = info.startPosition;
                player.playerInGame.currentPosition = info.startPosition;
                newPlayerList.push(player);
            }
        });

        this.playerList = newPlayerList;
    }
}
