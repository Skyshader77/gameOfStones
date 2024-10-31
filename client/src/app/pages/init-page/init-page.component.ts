import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { TEAM_NAMES, TEAM_NUMBER } from '@app/constants/team.constants';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';

@Component({
    selector: 'app-init-page',
    standalone: true,
    templateUrl: './init-page.component.html',
    styleUrls: ['./init-page.component.scss'],
    imports: [RouterLink, CommonModule, MessageDialogComponent],
})
export class InitPageComponent implements AfterViewInit {
    teamNumber = TEAM_NUMBER;
    teamNames = TEAM_NAMES;

    constructor(private modalMessageService: ModalMessageService) {}
    ngAfterViewInit(): void {
        const storedMessage = this.modalMessageService.getStoredMessage();
        if (storedMessage) {
            this.modalMessageService.showMessage(storedMessage);
        }
    }
}
