import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KICKED_PLAYER_MESSAGE, ROOM_CLOSED_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { Player } from '@app/interfaces/player';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { SocketService } from '@app/services/communication-services/socket.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
import { PlayerStartPosition } from '@common/interfaces/game-start-info';
import { MoveData } from '@common/interfaces/move';
import { Observable, Subject, Subscription } from 'rxjs';
import { MyPlayerService } from './my-player.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerListService {
    playerList: Player[] = [];
    currentPlayerName: string;
    private removalConfirmationSubject = new Subject<string>();

    private playerListSubscription: Subscription;
    private addedSubscription: Subscription;
    private removedSubscription: Subscription;
    private closedSubscription: Subscription;
    private abandonSubscription: Subscription;
    private teleportListen: Subscription;

    private socketService: SocketService = inject(SocketService);
    private roomSocketService: RoomSocketService = inject(RoomSocketService);
    private myPlayerService: MyPlayerService = inject(MyPlayerService);
    private router: Router = inject(Router);
    private modalMessageService: ModalMessageService = inject(ModalMessageService);
    private audioService: AudioService = inject(AudioService);

    get removalConfirmation$(): Observable<string> {
        return this.removalConfirmationSubject.asObservable();
    }

    initialize() {
        this.playerListSubscription = this.listenPlayerList();
        this.addedSubscription = this.listenPlayerAdded();
        this.removedSubscription = this.listenPlayerRemoved();
        this.closedSubscription = this.listenRoomClosed();
        this.abandonSubscription = this.listenToPlayerAbandon();
        this.teleportListen = this.listenPlayerTeleport();
    }

    cleanup() {
        this.playerListSubscription.unsubscribe();
        this.addedSubscription.unsubscribe();
        this.removedSubscription.unsubscribe();
        this.closedSubscription.unsubscribe();
        this.abandonSubscription.unsubscribe();
        this.teleportListen.unsubscribe();
    }

    getPlayerListCount(): number {
        return this.playerList ? this.playerList.filter((player) => !player.playerInGame.hasAbandoned).length : 0;
    }

    updateCurrentPlayer(currentPlayerName: string) {
        this.currentPlayerName = currentPlayerName;
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer) {
            currentPlayer.playerInGame.remainingActions = 1;
            currentPlayer.playerInGame.remainingMovement = currentPlayer.playerInGame.attributes.speed;
        }
        this.myPlayerService.isCurrentPlayer = this.currentPlayerName === this.myPlayerService.getUserName();
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

    getPlayerByName(playerName: string): Player | undefined {
        return this.playerList.find((player) => player.playerInfo.userName === playerName);
    }

    preparePlayersForGameStart(gameStartInformation: PlayerStartPosition[]) {
        const newPlayerList: Player[] = [];

        gameStartInformation.forEach((info) => {
            const player = this.playerList.find((listPlayer) => listPlayer.playerInfo.userName === info.userName);
            if (player) {
                const startPosition = { x: info.startPosition.x, y: info.startPosition.y };
                player.playerInGame.startPosition = startPosition;

                const currentPosition = { x: info.startPosition.x, y: info.startPosition.y };
                player.playerInGame.currentPosition = currentPosition;
                newPlayerList.push(player);
                if (this.myPlayerService.getUserName() === player.playerInfo.userName) {
                    this.myPlayerService.myPlayer = player;
                }
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

    private listenPlayerList(): Subscription {
        return this.socketService.on<Player[]>(Gateway.ROOM, RoomEvents.PlayerList).subscribe((players) => {
            this.playerList = players;
        });
    }

    private listenPlayerAdded(): Subscription {
        return this.socketService.on<Player>(Gateway.ROOM, RoomEvents.AddPlayer).subscribe((player) => {
            this.playerList.push(player);
            this.audioService.playSfx(Sfx.Join);
        });
    }

    private listenPlayerRemoved(): Subscription {
        return this.socketService.on<string>(Gateway.ROOM, RoomEvents.RemovePlayer).subscribe((playerName) => {
            if (playerName === this.myPlayerService.getUserName()) {
                this.modalMessageService.setMessage(KICKED_PLAYER_MESSAGE);
                this.router.navigate(['/init']);
            }
            this.playerList = this.playerList.filter((existingPlayer) => existingPlayer.playerInfo.userName !== playerName);
        });
    }

    private listenPlayerTeleport(): Subscription {
        return this.socketService.on<MoveData>(Gateway.GAME, GameEvents.Teleport).subscribe((teleportInfo) => {
            const player = this.playerList.find((existingPlayer) => existingPlayer.playerInfo.userName === teleportInfo.playerId);
            if (player) {
                player.playerInGame.currentPosition = { x: teleportInfo.destination.x, y: teleportInfo.destination.y };
            }
        });
    }

    private listenRoomClosed(): Subscription {
        return this.socketService.on<void>(Gateway.ROOM, RoomEvents.RoomClosed).subscribe(() => {
            this.modalMessageService.setMessage(ROOM_CLOSED_MESSAGE);
            this.router.navigate(['/init']);
        });
    }

    private listenToPlayerAbandon(): Subscription {
        return this.socketService.on<string>(Gateway.GAME, GameEvents.PlayerAbandoned).subscribe((abandonedPlayerName) => {
            const abandonedPlayer = this.playerList.find((player) => player.playerInfo.userName === abandonedPlayerName);

            if (abandonedPlayer) {
                abandonedPlayer.playerInGame.hasAbandoned = true;
            }
        });
    }
}
