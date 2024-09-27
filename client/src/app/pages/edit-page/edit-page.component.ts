import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StandardMessageDialogboxComponent } from '@app/components/standard-message-dialogbox/standard-message-dialogbox.component';
import { ValidationResult } from '@app/interfaces/validation';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapComponent } from '../../components/edit-page/map.component';
import { SidebarComponent } from '../../components/edit-page/sidebar.component';

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

    constructor(
        private mapManagerService: MapManagerService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        const mapId: string | null = this.route.snapshot.paramMap.get('id');
        this.mapManagerService.onInit(mapId);
    }

    openDialog(validation: ValidationResult): void {
        const messages = [];

        if (!validation.validationStatus.doorAndWallNumberValid) {
            messages.push('Il y a trop de murs et de portes sur la carte.');
        }

        if (!validation.validationStatus.wholeMapAccessible) {
            messages.push('Certaines parties de la carte sont inaccessibles dû à un agencement de murs.');
        }

        if (!validation.validationStatus.allStartPointsPlaced) {
            messages.push("Certains points de départ n'ont pas été placés.");
        }

        if (!validation.validationStatus.doorSurroundingsValid) {
            messages.push("L'encadrement de certaines portes est invalide.");
        }

        if (!validation.validationStatus.allItemsPlaced) {
            messages.push("Le nombre d'items placés est invalide.");
        }

        if (!validation.validationStatus.flagPlaced) {
            messages.push("Le drapeau n'a pas été placé.");
        }

        if (!validation.validationStatus.nameValid) {
            messages.push('Le nom est invalide.');
        }

        if (!validation.validationStatus.descriptionValid) {
            messages.push('La description est invalide.');
        }

        if (validation.validationStatus.isMapValid) {
            this.validationTitle = validation.message;
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
