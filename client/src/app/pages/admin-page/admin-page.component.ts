import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapCreationFormComponent } from '@app/components/map-creation-form/map-creation-form.component';
import { MapTableAdminComponent } from '@app/components/map-table-admin/map-table-admin.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { ADMIN_ICONS } from '@app/constants/admin.constants';
import { MapImportService } from '@app/services/admin-services/map-import/map-import.service';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection/map-selection.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    templateUrl: './admin-page.component.html',
    imports: [RouterLink, FontAwesomeModule, MapTableAdminComponent, MapCreationFormComponent, MessageDialogComponent],
})
export class AdminPageComponent implements OnInit {
    @ViewChild('mapCreationModal') mapCreationModal!: ElementRef<HTMLDialogElement>;

    adminIcons = ADMIN_ICONS;

    constructor(
        private mapSelectionService: MapSelectionService,
        private mapImportService: MapImportService,
    ) {}

    ngOnInit(): void {
        this.mapSelectionService.initialize();
    }

    openMapCreation(): void {
        this.mapCreationModal.nativeElement.showModal();
    }

    closeMapCreation(): void {
        this.mapCreationModal.nativeElement.close();
    }

    importMap(): void {
        this.mapImportService.importMap();
    }
}
