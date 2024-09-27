import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { StandardMessageDialogboxComponent } from '@app/components/standard-message-dialogbox/standard-message-dialogbox.component';
import { DELETE_MAP_ERROR_TITLE, HIDE_UNHIDE_MAP_ERROR_TITLE } from '@app/constants/admin-API.constants';
import { Map } from '@app/interfaces/map';
import { MapAdminService } from '@app/services/map-admin.service';
import { MapListService } from '@app/services/map-list.service';
import { MapSelectionService } from '@app/services/map-selection.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faX } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-map-table-admin',
    standalone: true,
    imports: [FontAwesomeModule, NgFor, NgIf, StandardMessageDialogboxComponent],
    templateUrl: './map-table-admin.component.html',
    providers: [DatePipe],
})
export class MapTableAdminComponent {
    @ViewChild('delete_confirmation_modal') deleteConfirmationModal: ElementRef;
    @ViewChild('standardMessageBox') standardMessageBox!: ElementRef<HTMLDialogElement>;
    faEdit = faEdit;
    faDelete = faX;
    datePipe: DatePipe;
    currentErrorMessageTitle: string;
    currentErrorMessageBody: string;
    constructor(
        protected mapSelectionService: MapSelectionService,
        protected mapListService: MapListService,
        protected mapAdminService: MapAdminService,
        datePipe: DatePipe,
    ) {
        this.datePipe = datePipe;
        this.mapListService = inject(MapListService);
        this.mapSelectionService = inject(MapSelectionService);
        this.mapAdminService = inject(MapAdminService);
    }

    onSelectMap(event: MouseEvent): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.type === 'radio') {
            const selectedMapIndex = inputElement.value;
            this.mapSelectionService.chooseSelectedMap(parseInt(selectedMapIndex, 10));
        }
    }
    formatDate(date: Date): string | undefined {
        return this.datePipe.transform(date, 'ss:mm:yy MMM d, y')?.toString();
    }

    deleteMap(map: Map) {
        this.mapAdminService.delete(map._id, map).subscribe({
            error: (error: { message: string }) => {
                this.currentErrorMessageTitle = DELETE_MAP_ERROR_TITLE;
                this.currentErrorMessageBody = error.message;
                this.standardMessageBox.nativeElement.showModal();
            },
        });
    }

    toggleVisibility(map: Map) {
        this.mapAdminService.toggleVisibility(map).subscribe({
            error: (error) => {
                this.currentErrorMessageTitle = HIDE_UNHIDE_MAP_ERROR_TITLE;
                this.currentErrorMessageBody = error.message;
                this.standardMessageBox.nativeElement.showModal();
            },
        });
    }
}
