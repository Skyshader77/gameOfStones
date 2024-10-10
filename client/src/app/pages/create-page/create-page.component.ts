import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { StandardMessageDialogboxComponent } from '@app/components/standard-message-dialogbox/standard-message-dialogbox.component';
import { FORM_ICONS } from '@app/constants/player.constants';
import { Room } from '@app/interfaces/room';
import { LobbyCreationService } from '@app/services/lobby-services/lobby-creation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink, FontAwesomeModule, MapListComponent, MapInfoComponent, PlayerCreationComponent, StandardMessageDialogboxComponent],
})
export class CreatePageComponent implements OnInit {
    @ViewChild('errorModal') errorModal!: ElementRef<HTMLDialogElement>;
    @ViewChild('playerCreationModal') playerCreationModal!: ElementRef<HTMLDialogElement>;

    formIcon = FORM_ICONS;

    constructor(
        public lobbyCreationService: LobbyCreationService,
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
                this.routerService.navigate(['/lobby', room.roomCode]);
            } else {
                this.manageError();
            }
        });
    }

    private manageError(): void {
        this.playerCreationModal.nativeElement.close();
        this.errorModal.nativeElement.showModal();
        this.lobbyCreationService.initialize();
    }
}
