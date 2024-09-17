import { Component, inject, Input } from '@angular/core';
import { MapSelectionService } from '@app/services/map-selection.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faEdit, faFileExport, faFileImport, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
@Component({
    selector: 'app-map-info',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './map-info.component.html',
})
export class MapInfoComponent {
    @Input() adminInfo = false;
    faEdit = faEdit;
    faExport = faFileExport;
    faDelete = faX;
    faBackward = faBackward;
    faFileImport = faFileImport;
    faPlus = faPlus;
    mapSelectionService: MapSelectionService = inject(MapSelectionService);
}
