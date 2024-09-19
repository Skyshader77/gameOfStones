import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { Room } from '@app/interfaces/room';
import { LobbyCreationService } from '@app/services/lobby-creation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink, FontAwesomeModule, MapListComponent, MapInfoComponent, PlayerCreationComponent],
})
export class CreatePageComponent implements OnInit {
    @ViewChild('playerCreationModal') playerCreationModal!: ElementRef<HTMLDialogElement>;
    @ViewChild('errorModal') errorModal!: ElementRef<HTMLDialogElement>;
    faBackward = faBackward;
    lobbyCreationService: LobbyCreationService = inject(LobbyCreationService);
    private routerService: Router = inject(Router);

    ngOnInit(): void {
        this.lobbyCreationService.initialize();
    }

    confirmMapSelection(): void {
        this.lobbyCreationService.isSelectionValid().subscribe((isValid: boolean) => {
            if (isValid) {
                // TODO Open PlayerCreationForm and maybe create room?
                this.playerCreationModal.nativeElement.showModal();
            } else {
                this.errorModal.nativeElement.showModal();
                // TODO reinitialize mapList since they changed
            }
        });
    }

    onSubmit(): void {
        // console.log('TODO: create the room on the server with the information of the organiser');
        let room: Room | null = null;

        this.lobbyCreationService.submitCreation().subscribe((newRoom) => {
            room = newRoom;
            if (room !== null) {
                this.routerService.navigate(['/lobby', room.roomCode]);
            }
        });
    }
}
