import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoomJoiningService } from '@app/services/room-services/room-joining.service';
import { FormsModule } from '@angular/forms';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { FORM_ICONS } from '@app/constants/player.constants';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { PlayerRole } from '@common/constants/player.constants';
import { Statistic } from '@app/interfaces/stats';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { Subscription } from 'rxjs';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { JoinErrors } from '@common/interfaces/join-errors';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import {
    INPUT_PLACEHOLDER,
    INVALID_ROOM_ERROR_MESSAGE,
    ROOM_DELETED_ERROR_MESSAGE,
    ROOM_LOCKED_ERROR_MESSAGE,
    WRONG_FORMAT_ERROR_MESSAGE,
} from '@common/constants/join-page.constants';
import { DecisionModalComponent } from '@app/components/decision-modal-dialog/decision-modal.component';
import { AvatarListService } from '@app/services/room-services/avatar-list.service';
import { ChangeDetectorRef } from '@angular/core';

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
export class JoinPageComponent {
    @ViewChild('playerCreationModal') playerCreationModal!: ElementRef<HTMLDialogElement>;

    formIcon = FORM_ICONS;
    userInput: string = '';
    roomCode: string = '';
    inputPlaceholder: string = INPUT_PLACEHOLDER;

    joinErrorListener: Subscription;
    joinEventListener: Subscription;
    avatarListListener: Subscription;
    protected roomJoiningService: RoomJoiningService = inject(RoomJoiningService);
    private modalMessageService: ModalMessageService = inject(ModalMessageService);
    private playerCreationService: PlayerCreationService = inject(PlayerCreationService);
    private routerService: Router = inject(Router);
    private refreshService: RefreshService = inject(RefreshService);
    private roomSocketService: RoomSocketService = inject(RoomSocketService);
    private myPlayerService: MyPlayerService = inject(MyPlayerService);
    private avatarListService: AvatarListService = inject(AvatarListService);
    private changeDetector: ChangeDetectorRef = inject(ChangeDetectorRef);

    ngOnInit() {
        this.refreshService.setRefreshDetector();
        this.joinErrorListener = this.roomSocketService.listenForJoinError().subscribe((joinError) => {
            this.showErrorMessage(joinError);
        });
        this.avatarListListener = this.roomSocketService.listenForAvatarList().subscribe((avatarData) => {
            this.avatarListService.avatarList = avatarData.avatarList;
            this.avatarListService.selectedAvatar = avatarData.selectedAvatar;
            this.changeDetector.detectChanges();
        });
        this.joinEventListener = this.roomSocketService.listenForRoomJoined().subscribe((player) => {
            this.myPlayerService.myPlayer = player;
            this.routerService.navigate(['/room', this.roomCode]);
        });
    }

    showErrorMessage(joinError: JoinErrors) {
        switch (joinError) {
            case JoinErrors.RoomDeleted:
                this.modalMessageService.showMessage(ROOM_DELETED_ERROR_MESSAGE);
                this.playerCreationModal.nativeElement.close();
                break;
            case JoinErrors.RoomLocked:
                this.modalMessageService.showDecisionMessage(ROOM_LOCKED_ERROR_MESSAGE);
                break;
        }
    }

    onJoinClicked(): void {
        if (!this.roomJoiningService.isValidInput(this.userInput)) {
            this.modalMessageService.showMessage(WRONG_FORMAT_ERROR_MESSAGE);
            return;
        }

        this.roomJoiningService.doesRoomExist(this.userInput).subscribe((exists) => {
            if (!exists) {
                this.modalMessageService.showMessage(INVALID_ROOM_ERROR_MESSAGE);
            } else {
                this.roomCode = this.userInput;
                this.playerCreationModal.nativeElement.showModal();
                this.roomJoiningService.handlePlayerCreationOpened(this.roomCode);
            }
        });
    }

    onSubmit(formData: { name: string; avatarId: number; statsBonus: Statistic; dice6: Statistic }): void {
        this.roomJoiningService.storedPlayer = this.playerCreationService.createPlayer(formData, PlayerRole.HUMAN);
        this.roomJoiningService.requestJoinRoom(this.roomCode);
    }
}
