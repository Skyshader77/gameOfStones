import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoomJoiningService } from '@app/services/room-services/room-joining.service';
import { FormsModule } from '@angular/forms';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { PlayerCreationForm } from '@app/interfaces/player-creation-form';
import { FORM_ICONS } from '@app/constants/player.constants';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { JOIN_ERRORS, JOIN_ERROR_TITLES } from '@app/constants/join-page.constants';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { PlayerRole } from '@common/interfaces/player.constants';
import { RefreshService } from '@app/services/utilitary/refresh.service';

@Component({
    selector: 'app-join-page',
    standalone: true,
    templateUrl: './join-page.component.html',
    styleUrls: [],
    imports: [RouterLink, FontAwesomeModule, FormsModule, PlayerCreationComponent, MessageDialogComponent, PlayerCreationComponent],
})
export class JoinPageComponent {
    @ViewChild('playerCreationModal') playerCreationModal!: ElementRef<HTMLDialogElement>;

    userInput: string = '';
    roomCode: string = '';
    inputPlaceholder: string = 'Entrez le code de la partie';
    formIcon = FORM_ICONS;

    constructor(
        private roomJoiningService: RoomJoiningService,
        private modalMessageService: ModalMessageService,
        private playerCreationService: PlayerCreationService,
        private routerService: Router,
        private refreshService: RefreshService,
    ) {}

    onJoinClicked(): void {
        if (!this.roomJoiningService.isValidInput(this.userInput)) {
            this.modalMessageService.showMessage({ title: JOIN_ERROR_TITLES.invalidID, content: JOIN_ERRORS.wrongFormat });
            return;
        }

        this.roomJoiningService.isIDValid(this.userInput).subscribe((isValid) => {
            if (!isValid) {
                this.modalMessageService.showMessage({
                    title: JOIN_ERROR_TITLES.invalidRoom,
                    content: JOIN_ERRORS.roomDoesNotExist,
                });
            } else {
                this.roomCode = this.userInput;
                this.playerCreationModal.nativeElement.showModal();
            }
        });
    }

    onSubmit(formData: PlayerCreationForm): void {
        const newPlayer = this.playerCreationService.createPlayer(formData, PlayerRole.HUMAN);
        this.roomJoiningService.joinRoom(this.roomCode, newPlayer);
        this.refreshService.setRefreshDetector();
        this.routerService.navigate(['/room', this.roomCode]);
    }
}
