import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { LobbyCreationService } from '@app/services/lobby-creation.service';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink, MapListComponent, MapInfoComponent, PlayerCreationComponent],
})
export class CreatePageComponent implements OnInit {
    @ViewChild('playerCreationModal') playerCreationModal!: ElementRef<HTMLDialogElement>;
    @ViewChild('errorModal') errorModal!: ElementRef<HTMLDialogElement>;
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
        console.log('TODO: create the room on the server with the information of the organiser');
        this.routerService.navigate(['/lobby']);
    }
}
