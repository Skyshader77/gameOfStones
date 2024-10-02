import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapCreationFormComponent } from '@app/components/map-creation-form/map-creation-form.component';
import { MapDescriptionBoxComponent } from '@app/components/map-description-box/map-description-box.component';
import { MapTableAdminComponent } from '@app/components/map-table-admin/map-table-admin.component';
import { ADMIN_ICONS } from '@app/constants/admin.constants';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    templateUrl: './admin-page.component.html',
    imports: [RouterLink, FontAwesomeModule, MapDescriptionBoxComponent, MapTableAdminComponent, MapCreationFormComponent],
})
export class AdminPageComponent implements OnInit {
    @ViewChild('mapCreationModal') mapCreationModal!: ElementRef<HTMLDialogElement>;

    adminIcons = ADMIN_ICONS;

    constructor(public mapSelectionService: MapSelectionService) {}

    ngOnInit(): void {
        this.mapSelectionService.initialize();
    }

    openMapCreation(): void {
        this.mapCreationModal.nativeElement.showModal();
    }

    closeMapCreation(): void {
        this.mapCreationModal.nativeElement.close();
    }
}
