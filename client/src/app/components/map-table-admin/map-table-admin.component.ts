import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ADMIN_ICONS, ADMIN_TABLE_COLUMNS, DATE_FORMAT, RADIO_INPUT } from '@app/constants/admin.constants';
import { MapAdminService } from '@app/services/admin-services/map-admin.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list.service';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';
import { Map } from '@common/interfaces/map';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-map-table-admin',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './map-table-admin.component.html',
    providers: [DatePipe],
})
export class MapTableAdminComponent {
    @ViewChild('deleteConfirmationModal') deleteConfirmationModal: ElementRef<HTMLDialogElement>;
    @ViewChild('standardMessageBox') standardMessageBox!: ElementRef<HTMLDialogElement>;

    adminIcons = ADMIN_ICONS;
    tableColumns = ADMIN_TABLE_COLUMNS;

    currentErrorMessageTitle: string = '';
    currentErrorMessageBody: string = '';

    constructor(
        public mapSelectionService: MapSelectionService,
        public mapListService: MapListService,
        public mapAdminService: MapAdminService,
        private datePipe: DatePipe,
    ) {}

    onSelectMap(event: MouseEvent): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.type === RADIO_INPUT) {
            const selectedMapIndex = inputElement.value;
            this.mapSelectionService.chooseSelectedMap(parseInt(selectedMapIndex, 10));
        }
    }

    formatDate(date: Date): string | undefined {
        return this.datePipe.transform(date, DATE_FORMAT)?.toString();
    }

    editMap(map: Map) {
        this.mapAdminService.editMap(map);
    }

    deleteMap(map: Map) {
        this.mapAdminService.deleteMap(map._id, map);
    }

    toggleVisibility(map: Map) {
        this.mapAdminService.toggleVisibilityMap(map);
    }
}
