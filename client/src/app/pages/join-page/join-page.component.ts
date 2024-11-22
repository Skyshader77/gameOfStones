import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DecisionModalComponent } from '@app/components/decision-modal-dialog/decision-modal.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import * as joinConstants from '@app/constants/join-page.constants';
import { FORM_ICONS } from '@app/constants/player.constants';
import { Player } from '@app/interfaces/player';
import { PlayerCreationForm } from '@app/interfaces/player-creation-form';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket/room-socket.service';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { AvatarListService } from '@app/services/states/avatar-list/avatar-list.service';
import { RoomJoiningService } from '@app/services/room-services/room-joining/room-joining.service';
import { JoinErrors } from '@common/enums/join-errors.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription } from 'rxjs';
import { RoomStateService } from '@app/services/states/room-state/room-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh/refresh.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { Pages } from '@app/constants/pages.constants';

@Component({
    selector: 'app-join-page',
    standalone: true,
    templateUrl: './join-page.component.html',
    styleUrls: [],
    imports: [
        RouterLink,
        FontAwesomeModule,
        FormsModule,
        PlayerCreationComponent,
        MessageDialogComponent,
        DecisionModalComponent,
        PlayerCreationComponent,
    ],
})
export class JoinPageComponent implements OnInit, OnDestroy {
    @ViewChild('playerCreationModal') playerCreationModal!: ElementRef<HTMLDialogElement>;
    @ViewChild(DecisionModalComponent) retryJoinModal!: DecisionModalComponent;

    formIcon = FORM_ICONS;
    userInput: string = '';
    inputPlaceholder: string = joinConstants.INPUT_PLACEHOLDER;

    private joinErrorListener: Subscription;
    private joinEventListener: Subscription;
    private avatarListListener: Subscription;
    private avatarSelectionListener: Subscription;

    private roomStateService: RoomStateService = inject(RoomStateService);
    private roomJoiningService: RoomJoiningService = inject(RoomJoiningService);
    private modalMessageService: ModalMessageService = inject(ModalMessageService);
    private playerCreationService: PlayerCreationService = inject(PlayerCreationService);
    private routerService: Router = inject(Router);
    private refreshService: RefreshService = inject(RefreshService);
    private roomSocketService: RoomSocketService = inject(RoomSocketService);
    private myPlayerService: MyPlayerService = inject(MyPlayerService);
    private avatarListService: AvatarListService = inject(AvatarListService);
    private audioService: AudioService = inject(AudioService);

    get roomCode(): string {
        return this.roomStateService.roomCode;
    }

    get playerToJoin(): Player {
        return this.roomJoiningService.playerToJoin;
    }

    ngOnInit(): void {
        this.refreshService.setRefreshDetector();
        this.joinErrorListener = this.roomSocketService.listenForJoinError().subscribe((joinError) => {
            this.showErrorMessage(joinError);
        });
        this.avatarListListener = this.roomSocketService.listenForAvatarList().subscribe((avatarList) => {
            this.avatarListService.avatarsTakenState = avatarList;
            this.retryJoinModal.closeDialog();
            setTimeout(() => {
                this.playerCreationModal.nativeElement.showModal();
            }, joinConstants.TIME_BETWEEN_MODALS_MS); // Small timeout because opening a modal immediately after closing another one creates an issue where the second modal doesn't appear
        });
        this.avatarSelectionListener = this.roomSocketService.listenForAvatarSelected().subscribe((avatarSelection) => {
            this.avatarListService.setSelectedAvatar(avatarSelection);
        });
        this.joinEventListener = this.roomSocketService.listenForRoomJoined().subscribe((player) => {
            this.myPlayerService.myPlayer = player;
            this.retryJoinModal.closeDialog();
            this.routerService.navigate([`/${Pages.Room}`, this.roomCode]);
        });
    }

    showErrorMessage(joinError: JoinErrors): void {
        this.audioService.playSfx(Sfx.Error);
        switch (joinError) {
            case JoinErrors.RoomDeleted:
                this.modalMessageService.showMessage(joinConstants.ROOM_DELETED_ERROR_MESSAGE);
                this.playerCreationModal.nativeElement.close();
                break;
            case JoinErrors.RoomLocked:
                if (!this.retryJoinModal.isOpen) this.modalMessageService.showDecisionMessage(joinConstants.ROOM_LOCKED_ERROR_MESSAGE);
                break;
        }
    }

    onJoinClicked(): void {
        if (!this.roomJoiningService.isValidInput(this.userInput)) {
            this.audioService.playSfx(Sfx.Error);
            this.modalMessageService.showMessage(joinConstants.WRONG_FORMAT_ERROR_MESSAGE);
            return;
        }

        this.roomJoiningService.doesRoomExist(this.userInput).subscribe((exists) => {
            if (!exists) {
                this.audioService.playSfx(Sfx.Error);
                this.modalMessageService.showMessage(joinConstants.INVALID_ROOM_ERROR_MESSAGE);
            } else {
                this.roomStateService.roomCode = this.userInput;
                this.roomJoiningService.handlePlayerCreationOpened(this.roomCode);
            }
        });
    }

    onSubmit(formData: PlayerCreationForm): void {
        this.roomJoiningService.playerToJoin = this.playerCreationService.createPlayer(formData, PlayerRole.Human);
        this.roomJoiningService.requestJoinRoom(this.roomCode);
    }

    onFormClosed(): void {
        this.avatarListService.sendPlayerCreationClosed(this.roomCode);
    }

    handleAcceptEvent(): void {
        if (this.playerCreationModal.nativeElement.open) this.roomJoiningService.requestJoinRoom(this.roomCode);
        else this.roomJoiningService.handlePlayerCreationOpened(this.roomCode);
    }

    handleCloseEvent(): void {
        if (this.playerCreationModal.nativeElement.open) this.avatarListService.sendPlayerCreationClosed(this.roomCode);
        this.routerService.navigate([`/${Pages.Init}`]);
    }

    ngOnDestroy(): void {
        this.joinErrorListener.unsubscribe();
        this.avatarListListener.unsubscribe();
        this.avatarSelectionListener.unsubscribe();
        this.joinEventListener.unsubscribe();
    }
}
