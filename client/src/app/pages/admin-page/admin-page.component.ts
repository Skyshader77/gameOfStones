import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapCreationFormComponent } from '@app/components/map-creation-form/map-creation-form.component';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListAdminComponent } from '@app/components/map-list-admin/map-list-admin.component';
import { MapSelectionService } from '@app/services/map-selection.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faEdit, faFileExport, faFileImport, faPlus, faX } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    templateUrl: './admin-page.component.html',
    imports: [RouterLink, FontAwesomeModule, MapInfoComponent, MapListAdminComponent, MapCreationFormComponent],
})
export class AdminPageComponent implements OnInit {
    @ViewChild('mapCreationModal') mapCreationModal!: ElementRef<HTMLDialogElement>;
    faEdit = faEdit;
    faExport = faFileExport;
    faDelete = faX;
    faBackward = faBackward;
    faFileImport = faFileImport;
    faPlus = faPlus;
    mapSelectionService: MapSelectionService = inject(MapSelectionService);

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
