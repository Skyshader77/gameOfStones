import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { FORM_ICONS } from '@app/constants/player.constants';
import { Room } from '@app/interfaces/room';
import { RoomCreationService } from '@app/services/room-services/room-creation.service';
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
        public lobbyCreationService: RoomCreationService,
        private routerService: Router,
    ) {}

    ngOnInit(): void {
        this.lobbyCreationService.initialize();
    }

    confirmMapSelection(): void {
        this.lobbyCreationService
            .isSelectionValid()
            .subscribe((isValid: boolean) => (isValid ? this.playerCreationModal.nativeElement.showModal() : this.manageError()));
    }

    onSubmit(): void {
        this.lobbyCreationService.submitCreation().subscribe((room: Room | null) => {
            if (room !== null) {
                this.routerService.navigate(['/room', room.roomCode]);
            } else {
                this.manageError();
            }
        });
    }

    private manageError(): void {
        this.playerCreationModal.nativeElement.close();
        this.lobbyCreationService.initialize();
    }
}
