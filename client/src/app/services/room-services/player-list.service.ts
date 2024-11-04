import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KICKED_PLAYER_MESSAGE, ROOM_CLOSED_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { Player } from '@app/interfaces/player';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { SocketService } from '@app/services/communication-services/socket.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
import { PlayerStartPosition } from '@common/interfaces/game-start-info';
import { Observable, Subject, Subscription } from 'rxjs';
import { MyPlayerService } from './my-player.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerListService {
    playerList: Player[] = [];
    currentPlayerName: string;
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

    getPlayerListCount(): number | undefined {
        return this.playerList ? this.playerList.length : undefined;
    }

    /*  getCurrentPlayerName(): string | undefined {
        const currentPlayerName = this.playerList?.find((player) => player.playerInGame.isCurrentPlayer === true);

        return currentPlayerName ? currentPlayerName.playerInfo.userName : undefined;
    } */

    listenPlayerListUpdated(): Subscription {
        return this.socketService.on<Player[]>(Gateway.ROOM, RoomEvents.PlayerList).subscribe((players) => {
            this.playerList = players.map((player) => player);
        });
    }

    listenPlayerAdded(): Subscription {
        return this.socketService.on<Player>(Gateway.ROOM, RoomEvents.AddPlayer).subscribe((player) => {
            this.playerList.push(player);
        });
    }

    updateCurrentPlayer(currentPlayerName: string) {
        this.currentPlayerName = currentPlayerName;
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer) {
            currentPlayer.playerInGame.remainingActions = 1;
        }
        this.myPlayerService.isCurrentPlayer = this.currentPlayerName === this.myPlayerService.getUserName();
    }

    listenPlayerRemoved(): Subscription {
        return this.socketService.on<string>(Gateway.ROOM, RoomEvents.RemovePlayer).subscribe((playerName) => {
            if (playerName === this.myPlayerService.getUserName()) {
                this.modalMessageService.setMessage(KICKED_PLAYER_MESSAGE);
                this.router.navigate(['/init']);
            }
            this.playerList = this.playerList.filter((existingPlayer) => existingPlayer.playerInfo.userName !== playerName);
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

    getCurrentPlayer(): Player | undefined {
        return this.playerList.find((player) => player.playerInfo.userName === this.currentPlayerName);
    }

    listenToPlayerAbandon(): Subscription {
        return this.socketService.on<string>(Gateway.GAME, GameEvents.PlayerAbandoned).subscribe((abandonnedPlayerName) => {
            this.playerList = this.playerList.filter((player) => player.playerInfo.userName !== abandonnedPlayerName);
            if (abandonnedPlayerName === this.myPlayerService.getUserName()) {
                this.router.navigate(['/init']);
            }
        });
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

    actionsLeft() {
        const player = this.getCurrentPlayer();
        if (player) {
            return player.playerInGame.remainingActions;
        }
        return 0;
    }
}
