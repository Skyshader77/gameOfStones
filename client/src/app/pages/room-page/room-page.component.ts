import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { DecisionModalComponent } from '@app/components/decision-modal-dialog/decision-modal.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { SfxButtonComponent } from '@app/components/sfx-button/sfx-button.component';
import { LEFT_ROOM_MESSAGE } from '@app/constants/init-page-redirection.constants';
import {
    COPY_SUCCESS_MESSAGE,
    KICK_PLAYER_CONFIRMATION_MESSAGE,
    LEAVE_ROOM_CONFIRMATION_MESSAGE,
    MESSAGE_DURATION_MS,
} from '@app/constants/room.constants';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';
import { ChatListService } from '@app/services/chat-service/chat-list.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket/room-socket.service';
import { RoomStateService } from '@app/services/states/room-state/room-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh/refresh.service';
import { PlayerRole } from '@common/enums/player-role.enum';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { Pages } from '@app/constants/pages.constants';
import { OVERLORD } from '@app/constants/audio.constants';

@Component({
    selector: 'app-room-page',
    standalone: true,
    templateUrl: './room-page.component.html',
    styleUrls: [],
    imports: [CommonModule, FontAwesomeModule, PlayerListComponent, ChatComponent, DecisionModalComponent, FormsModule, SfxButtonComponent],
})
export class RoomPageComponent implements OnInit, OnDestroy {
    @ViewChild(DecisionModalComponent) decisionModal: DecisionModalComponent;

    selectedBehavior: string;
    copySuccessMessage: string | null = null;
    kickingPlayer: boolean; // Used to assign a callback to the decision modal based on if we are kicking a player or leaving the room
    removedPlayerName: string;
    faLockIcon = faLock;
    faBackwardIcon = faBackward;
    faOpenLockIcon = faLockOpen;
    leaveRoomMessage = LEAVE_ROOM_CONFIRMATION_MESSAGE;
    messageDuration = MESSAGE_DURATION_MS;

    startGameSfx = Sfx.StartGame;
    lockSfx = Sfx.Lock;

    private myPlayerService = inject(MyPlayerService);
    private roomStateService = inject(RoomStateService);
    private route = inject(ActivatedRoute);
    private playerListService = inject(PlayerListService);
    private refreshService = inject(RefreshService);
    private roomSocketService = inject(RoomSocketService);
    private routerService = inject(Router);
    private modalMessageService = inject(ModalMessageService);
    private chatListService = inject(ChatListService);
    private gameLogicSocketService = inject(GameLogicSocketService);
    private gameStartSubscription: Subscription;
    private removalConfirmationSubscription: Subscription;

    constructor(private audioService: AudioService) {}

    get roomCode(): string {
        return this.roomStateService.roomCode;
    }

    get isLocked(): boolean {
        return this.roomStateService.isLocked;
    }

    get isOrganizer(): boolean {
        return this.myPlayerService.isOrganizer();
    }

    get playerLimitReached(): boolean {
        return this.roomStateService.playerLimitReached;
    }

    ngOnInit(): void {
        if (this.refreshService.wasRefreshed()) {
            this.modalMessageService.setMessage(LEFT_ROOM_MESSAGE);
            this.routerService.navigate([`/${Pages.Init}`]);
        }
        this.roomStateService.roomCode = this.route.snapshot.paramMap.get('id') || '';
        this.roomStateService.initialize();
        if (this.roomCode) {
            this.gameStartSubscription = this.gameLogicSocketService.listenToStartGame();
        }
        this.removalConfirmationSubscription = this.playerListService.removalConfirmation$.subscribe((userName: string) => {
            this.removedPlayerName = userName;
            this.kickingPlayer = true;
            this.modalMessageService.showDecisionMessage(KICK_PLAYER_CONFIRMATION_MESSAGE);
        });

        if (this.myPlayerService.getUserName() === OVERLORD) {
            this.audioService.playSfx(Sfx.OverlordIntroduction);
        }
    }

    toggleRoomLock(): void {
        this.audioService.playSfx(Sfx.Lock);
        this.roomSocketService.toggleRoomLock(this.roomStateService.roomCode);
    }

    quitRoom(): void {
        this.roomSocketService.leaveRoom();
        this.routerService.navigate([`/${Pages.Init}`]);
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

    onStartGame() {
        this.audioService.playSfx(Sfx.StartGame);
        this.gameLogicSocketService.sendStartGame();
    }

    ngOnDestroy(): void {
        this.gameStartSubscription.unsubscribe();
        this.roomStateService.onCleanUp();
        this.chatListService.cleanup();
        this.removalConfirmationSubscription.unsubscribe();
    }

    isGameNotReady(): boolean {
        return this.playerListService.playerList.length < 2 || !this.isLocked;
    }

    onAddVirtualPlayer(): void {
        const role: PlayerRole = this.selectedBehavior === 'aggressive' ? PlayerRole.AggressiveAI : PlayerRole.DefensiveAI;
        this.roomSocketService.addVirtualPlayer(role);
    }

    copyRoomCode(): void {
        if (this.roomCode && navigator.clipboard) {
            navigator.clipboard.writeText(this.roomCode).then(() => {
                this.copySuccessMessage = COPY_SUCCESS_MESSAGE;
                setTimeout(() => {
                    this.copySuccessMessage = null;
                }, this.messageDuration);
            });
        }
    }
}
