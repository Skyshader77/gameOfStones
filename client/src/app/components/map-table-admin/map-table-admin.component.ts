import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ADMIN_ICONS, ADMIN_TABLE_COLUMNS, DATE_FORMAT, RADIO_INPUT } from '@app/constants/admin.constants';
import { Sfx } from '@app/interfaces/sfx';
import { RADIX } from '@app/constants/edit-page.constants';
import { MapAdminService } from '@app/services/admin-services/map-admin/map-admin.service';
import { MapExportService } from '@app/services/admin-services/map-export/map-export.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection/map-selection.service';
import { Map } from '@common/interfaces/map';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AudioService } from '@app/services/audio/audio.service';

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
        private mapSelectionService: MapSelectionService,
        private mapListService: MapListService,
        private mapAdminService: MapAdminService,
        private mapExportService: MapExportService,
        private datePipe: DatePipe,
        private audioService: AudioService,
    ) {}

    get maps() {
        return this.mapListService.serviceMaps;
    }

    get isLoaded() {
        return this.mapListService.isLoaded;
    }

    isMapSelected(map: Map): boolean {
        return map === this.mapSelectionService.selectedMap;
    }

    onSelectMap(event: MouseEvent): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.type === RADIO_INPUT) {
            const selectedMapIndex = inputElement.value;
            this.mapSelectionService.chooseSelectedMap(parseInt(selectedMapIndex, RADIX));
        }
    }

    formatDate(date: Date): string | undefined {
        return this.datePipe.transform(date, DATE_FORMAT)?.toString();
    }

    editMap(map: Map) {
        this.audioService.playSfx(Sfx.MapEdited, 0.5, 1);
        this.mapAdminService.editMap(map);
    }

    deleteMap(map: Map) {
        this.audioService.playSfx(Sfx.MapDeleted, 0.5);
        this.mapAdminService.deleteMap(map._id, map);
    }

    toggleVisibility(map: Map) {
        this.audioService.playSfx(Sfx.ButtonClicked);
        this.mapAdminService.toggleVisibilityMap(map);
    }

    exportMap(map: Map) {
        this.audioService.playSfx(Sfx.MapExported);
        this.mapExportService.exportMap(map);
    }
}
