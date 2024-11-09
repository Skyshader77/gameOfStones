import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { MapCreationFormComponent } from '@app/components/map-creation-form/map-creation-form.component';
import { MapTableAdminComponent } from '@app/components/map-table-admin/map-table-admin.component';
import { ADMIN_ICONS } from '@app/constants/admin.constants';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MapImportService } from '@app/services/admin-services/map-import.service';

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
        public mapSelectionService: MapSelectionService,
        public mapImportService: MapImportService,
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
