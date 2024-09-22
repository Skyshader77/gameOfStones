import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StandardMessageDialogboxComponent } from '@app/components/standard-message-dialogbox/standard-message-dialogbox.component';
import { GameMode } from '@app/interfaces/map';
import { DataConversionService } from '@app/services/edit-page-services/data-conversion.service';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapComponent } from './map.component';
import { SidebarComponent } from './sidebar.component';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    templateUrl: './edit-page.component.html',
    styleUrls: [],
    imports: [SidebarComponent, MapComponent, StandardMessageDialogboxComponent],
})
export class EditPageComponent implements OnInit {
    showDialog: boolean = false;
    validationMessage: string;
    validationTitle: string;

    gameMode: GameMode = GameMode.CTF;
    convertTerrainToString = this.dataConversionService.convertTerrainToString;

    constructor(
        private mapManagerService: MapManagerService,
        private dataConversionService: DataConversionService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        const mapId: string | null = this.route.snapshot.paramMap.get('id');
        this.mapManagerService.onInit(mapId);
    }

    openDialog(validationStatus: {
        doorAndWallNumberValid: boolean;
        wholeMapAccessible: boolean;
        allStartPointsPlaced: boolean;
        doorSurroundingsValid: boolean;
        flagPlaced: boolean;
        isMapValid: boolean;
    }): void {
        const messages = [];

        if (!validationStatus.doorAndWallNumberValid) {
            messages.push('Il y a trop de murs et de portes sur la carte.');
        }

        if (!validationStatus.wholeMapAccessible) {
            messages.push('Certaines parties de la carte sont inaccessibles dû à un agencement de murs.');
        }

        if (!validationStatus.allStartPointsPlaced) {
            messages.push("Certains points de départ n'ont pas été placés.");
        }

        if (!validationStatus.doorSurroundingsValid) {
            messages.push("L'encadrement de certaines portes est invalide.");
        }

        if (!validationStatus.flagPlaced) {
            messages.push("Le drapeau n'a pas été placé.");
        }

        if (validationStatus.isMapValid) {
            this.validationTitle = 'La carte est valide!';
        } else {
            this.validationTitle = 'La carte est invalide.';
        }

        this.validationMessage = messages.join('\n'); // Combine messages into a single string

        const dialog = document.getElementById('editPageDialog') as HTMLDialogElement;
        if (dialog) {
            dialog.showModal();
        }
    }
}
