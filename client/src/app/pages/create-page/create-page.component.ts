import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { LobbyCreationService } from '@app/services/lobby-creation.service';

@Component({
    selector: 'app-create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink, MapListComponent],
})
export class CreatePageComponent implements OnInit {
    @ViewChild('errorModal') errorModal!: ElementRef<HTMLDialogElement>;
    lobbyCreationService: LobbyCreationService = inject(LobbyCreationService);

    ngOnInit(): void {
        this.lobbyCreationService.initialize();
    }

    confirmMapSelection(): void {
        this.lobbyCreationService.isSelectionValid().subscribe((isValid: boolean) => {
            if (isValid) {
                // TODO Open PlayerCreationForm
            } else {
                this.errorModal.nativeElement.showModal();
                // TODO reinitialize mapList since they changed
            }
        });
    }
}
