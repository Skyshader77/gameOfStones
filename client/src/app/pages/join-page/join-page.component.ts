import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoomJoiningService } from '@app/room-services/room-joining.service';
import { FormsModule } from '@angular/forms';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { FORM_ICONS } from '@app/constants/player.constants';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import * as constants from '@app/constants/join-page.constants';

@Component({
    selector: 'app-join-page',
    standalone: true,
    templateUrl: './join-page.component.html',
    styleUrls: [],
    imports: [RouterLink, FontAwesomeModule, FormsModule, PlayerCreationComponent, MessageDialogComponent],
})
export class JoinPageComponent {
    @ViewChild('playerCreationModal') playerCreationModal!: ElementRef<HTMLDialogElement>;

    userInput: string = '';
    inputPlaceholder: string = 'Entrez le code de la partie';
    isInputValid: boolean = true;
    doesRoomExist: boolean = true;
    formIcon = FORM_ICONS;

    constructor(
        private roomJoiningService: RoomJoiningService,
        private modalMessageService: ModalMessageService,
    ) {}

    onJoinClicked(): void {
        this.isInputValid = this.roomJoiningService.isValidInput(this.userInput);

        if (!this.isInputValid) {
            this.modalMessageService.showMessage({ title: constants.JOIN_ERROR_TITLES.invalidID, content: constants.JOIN_ERRORS.wrongFormat });
            return;
        }

        this.roomJoiningService.isIDValid(this.userInput).subscribe((isValid) => {
            if (!isValid) {
                this.modalMessageService.showMessage({
                    title: constants.JOIN_ERROR_TITLES.invalidRoom,
                    content: constants.JOIN_ERRORS.roomDoesNotExist,
                });
            } else {
                this.playerCreationModal.nativeElement.showModal();
            }
        });
    }
}
