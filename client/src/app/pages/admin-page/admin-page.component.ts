import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapCreationFormComponent } from '@app/components/map-creation-form/map-creation-form.component';
import { MapDescriptionBoxComponent } from '@app/components/map-description-box/map-description-box.component';
import { MapTableAdminComponent } from '@app/components/map-table-admin/map-table-admin.component';
import { MapListService } from '@app/services/map-list.service';
import { MapSelectionService } from '@app/services/map-selection.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faFileImport, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    templateUrl: './admin-page.component.html',
    imports: [RouterLink, FontAwesomeModule, MapDescriptionBoxComponent, MapTableAdminComponent, MapCreationFormComponent],
})
export class AdminPageComponent implements OnInit {
    @ViewChild('mapCreationModal') mapCreationModal!: ElementRef<HTMLDialogElement>;
    faBackward = faBackward;
    faFileImport = faFileImport;
    faPlus = faPlus;
    mapSelectionService: MapSelectionService = inject(MapSelectionService);
    mapListService: MapListService = inject(MapListService);
    ngOnInit(): void {
        this.mapListService.initialize();
        this.mapSelectionService.initialize();
    }

    openMapCreation(): void {
        this.mapCreationModal.nativeElement.showModal();
    }
    closeMapCreation(): void {
        this.mapCreationModal.nativeElement.close();
    }
}
