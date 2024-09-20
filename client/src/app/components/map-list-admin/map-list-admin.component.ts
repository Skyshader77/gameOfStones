import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MapSelectionService } from '@app/services/map-selection.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faEdit, faFileExport, faFileImport, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
@Component({
    selector: 'app-map-list-admin',
    standalone: true,
    imports: [FontAwesomeModule, NgFor, NgIf],
    templateUrl: './map-list-admin.component.html',
    providers: [DatePipe],
})
export class MapListAdminComponent {
    @ViewChild('delete_confirmation_modal') deleteConfirmationModal: ElementRef;
    faEdit = faEdit;
    faExport = faFileExport;
    faDelete = faX;
    faBackward = faBackward;
    faFileImport = faFileImport;
    faPlus = faPlus;
    datePipe: DatePipe;
    constructor(
        protected mapSelectionService: MapSelectionService,
        datePipe: DatePipe,
    ) {
        this.datePipe = datePipe;
        this.mapSelectionService = inject(MapSelectionService);
    }

    onSelectMap(event: MouseEvent): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.type === 'radio') {
            const selectedMapIndex = inputElement.value;
            this.mapSelectionService.chooseSelectedMap(parseInt(selectedMapIndex, 10));
        }
    }
    formatDate(date: Date): string {
        return this.datePipe.transform(date, 'ss:mm:yy MMM d, y') || '';
    }
}
