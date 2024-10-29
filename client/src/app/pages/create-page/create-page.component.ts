import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { FORM_ICONS } from '@app/constants/player.constants';
import { Statistic } from '@app/interfaces/stats';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { RoomCreationService } from '@app/services/room-services/room-creation.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { PlayerRole } from '@common/interfaces/player.constants';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink, FontAwesomeModule, MapListComponent, MapInfoComponent, PlayerCreationComponent, MessageDialogComponent],
})
export class CreatePageComponent implements OnInit {
    @ViewChild('playerCreationModal') playerCreationModal!: ElementRef<HTMLDialogElement>;

    formIcon = FORM_ICONS;

    constructor(
        public roomCreationService: RoomCreationService,
        private playerCreationService: PlayerCreationService,
        private routerService: Router,
        private refreshService: RefreshService,
    ) {}

    ngOnInit(): void {
        this.roomCreationService.initialize();
    }

    confirmMapSelection(): void {
        this.roomCreationService
            .isSelectionValid()
            .subscribe((isValid: boolean) => (isValid ? this.playerCreationModal.nativeElement.showModal() : this.manageError()));
    }

    onSubmit(formData: { name: string; avatarId: number; statsBonus: Statistic; dice6: Statistic }): void {
        const newPlayer = this.playerCreationService.createPlayer(formData, PlayerRole.ORGANIZER);
        this.roomCreationService.submitCreation().subscribe(({ room, selectedMap }) => {
            if (room && selectedMap) {
                this.roomCreationService.handleRoomCreation(newPlayer, room.roomCode, selectedMap);
                this.refreshService.setRefreshDetector();
                this.routerService.navigate(['/room', room.roomCode]);
            } else {
                this.manageError();
            }
        });
    }

    private manageError(): void {
        this.playerCreationModal.nativeElement.close();
        this.roomCreationService.initialize();
    }
}
