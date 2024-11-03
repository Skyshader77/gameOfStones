import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { DecisionModalComponent } from '@app/components/decision-modal-dialog/decision-modal.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { LEFT_ROOM_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { KICK_PLAYER_CONFIRMATION_MESSAGE, LEAVE_ROOM_CONFIRMATION_MESSAGE } from '@app/constants/room.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { RoomStateService } from '@app/services/room-services/room-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-room-page',
    standalone: true,
    templateUrl: './room-page.component.html',
    styleUrls: [],
    imports: [RouterLink, CommonModule, FontAwesomeModule, PlayerListComponent, ChatComponent, DecisionModalComponent],
})
export class RoomPageComponent implements OnInit, OnDestroy {
    @ViewChild(DecisionModalComponent) decisionModal: DecisionModalComponent;

    kickingPlayer: boolean; // Used to assign a callback to the decision modal based on if we are kicking a player or leaving the room
    removedPlayerName: string;
    faLockIcon = faLock;
    faOpenLockIcon = faLockOpen;
    leaveRoomMessage = LEAVE_ROOM_CONFIRMATION_MESSAGE;

    myPlayerService: MyPlayerService = inject(MyPlayerService);
    roomStateService: RoomStateService = inject(RoomStateService);
    route = inject(ActivatedRoute);
    playerListService = inject(PlayerListService);
    refreshService = inject(RefreshService);
    roomSocketService = inject(RoomSocketService);
    routerService = inject(Router);
    modalMessageService = inject(ModalMessageService);
    private playerListSubscription: Subscription;
    private gameStartSubscription: Subscription;
    private removalConfirmationSubscription: Subscription;
    constructor(public gameLogicSocketService: GameLogicSocketService) {}
    get roomCode(): string {
        return this.roomStateService.roomCode;
    }

    ngOnInit(): void {
        if (this.refreshService.wasRefreshed()) {
            this.modalMessageService.setMessage(LEFT_ROOM_MESSAGE);
            this.routerService.navigate(['/init']);
        }
        this.roomStateService.roomCode = this.route.snapshot.paramMap.get('id') || '';
        if (this.roomCode) {
            this.gameStartSubscription = this.gameLogicSocketService.listenToStartGame();
            this.playerListSubscription = this.playerListService.listenPlayerListUpdated();
        }
        this.roomStateService.initialize();
        this.removalConfirmationSubscription = this.playerListService.removalConfirmation$.subscribe((userName: string) => {
            this.removedPlayerName = userName;
            this.kickingPlayer = true;
            this.modalMessageService.showDecisionMessage(KICK_PLAYER_CONFIRMATION_MESSAGE);
        });
    }

    toggleRoomLock(): void {
        this.roomSocketService.toggleRoomLock(this.roomStateService.roomCode);
    }

    quitRoom(): void {
        this.roomSocketService.leaveRoom();
        this.routerService.navigate(['/init']);
    }

    displayLeavingConfirmation(): void {
        this.kickingPlayer = false;
        this.modalMessageService.showDecisionMessage(LEAVE_ROOM_CONFIRMATION_MESSAGE);
    }

    handleAcceptEvent(): void {
        this.decisionModal.closeDialog();
        if (this.kickingPlayer) this.playerListService.removePlayer(this.removedPlayerName);
        else this.quitRoom();
    }

    ngOnDestroy(): void {
        this.playerListSubscription.unsubscribe();
        this.gameStartSubscription.unsubscribe();
        this.roomStateService.onCleanUp();
        this.removalConfirmationSubscription.unsubscribe();
    }
}
