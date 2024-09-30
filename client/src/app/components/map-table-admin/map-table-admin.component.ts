import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { StandardMessageDialogboxComponent } from '@app/components/standard-message-dialogbox/standard-message-dialogbox.component';
import { ADMIN_MAP_ERROR_TITLE, ADMIN_TABLE_COLUMNS } from '@app/constants/admin.constants';
import { Map } from '@app/interfaces/map';
import { MapAdminService } from '@app/services/map-admin.service';
import { MapListService } from '@app/services/map-list.service';
import { MapSelectionService } from '@app/services/map-selection.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faX } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-map-table-admin',
    standalone: true,
    imports: [FontAwesomeModule, StandardMessageDialogboxComponent],
    templateUrl: './map-table-admin.component.html',
    providers: [DatePipe],
})
export class MapTableAdminComponent {
    @ViewChild('deleteConfirmationModal') deleteConfirmationModal: ElementRef<HTMLDialogElement>;
    @ViewChild('standardMessageBox') standardMessageBox!: ElementRef<HTMLDialogElement>;

    faEdit = faEdit;
    faDelete = faX;
    tableColumns = ADMIN_TABLE_COLUMNS;

    currentErrorMessageTitle: string = '';
    currentErrorMessageBody: string = '';

    constructor(
        protected mapSelectionService: MapSelectionService,
        protected mapListService: MapListService,
        protected mapAdminService: MapAdminService,
        private datePipe: DatePipe,
    ) {}

    onSelectMap(event: MouseEvent): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.type === 'radio') {
            const selectedMapIndex = inputElement.value;
            this.mapSelectionService.chooseSelectedMap(parseInt(selectedMapIndex, 10));
        }
    }

    formatDate(date: Date): string | undefined {
        return this.datePipe.transform(date, 'MMM dd, yyyy hh:mm:ss a')?.toString();
    }

    editMap(map: Map) {
        this.mapAdminService.editMap(map).subscribe({
            error: (error: Error) => {
                this.handleError(error, ADMIN_MAP_ERROR_TITLE.updateMap);
            },
        });
    }

    deleteMap(map: Map) {
        this.mapAdminService.deleteMap(map._id, map).subscribe({
            error: (error: Error) => {
                this.handleError(error, ADMIN_MAP_ERROR_TITLE.deleteMap);
            },
        });
    }

    toggleVisibility(map: Map) {
        this.mapAdminService.toggleVisibilityMap(map).subscribe({
            error: (error: Error) => {
                this.handleError(error, ADMIN_MAP_ERROR_TITLE.hideUnhide);
            },
        });
    }

    private handleError(error: Error, newErrorTitle: string) {
        this.currentErrorMessageTitle = newErrorTitle;
        this.currentErrorMessageBody = error.message;
        this.standardMessageBox.nativeElement.showModal();
    }
}
