import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { Room } from '@app/interfaces/room';
import { LobbyCreationService } from '@app/services/lobby-creation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faX } from '@fortawesome/free-solid-svg-icons';

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
    faX = faX;

    lobbyCreationService: LobbyCreationService = inject(LobbyCreationService);
    private routerService: Router = inject(Router);

    ngOnInit(): void {
        this.lobbyCreationService.initialize();
    }

    confirmMapSelection(): void {
        this.lobbyCreationService.isSelectionValid().subscribe((isValid: boolean) => {
            if (isValid) {
                this.playerCreationModal.nativeElement.showModal();
            } else {
                this.manageError();
            }
        });
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

    manageError(): void {
        this.playerCreationModal.nativeElement.close();
        this.errorModal.nativeElement.showModal();
        this.lobbyCreationService.initialize();
    }
}
