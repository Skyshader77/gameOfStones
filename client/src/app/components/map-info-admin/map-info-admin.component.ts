import { Component, inject, Input } from '@angular/core';
import { MapSelectionService } from '@app/services/map-selection.service';

@Component({
    selector: 'app-map-info-admin',
    standalone: true,
    imports: [],
    templateUrl: './map-info-admin.component.html',
})
export class MapInfoAdminComponent {
    @Input() isadminPage = false;
    mapSelectionService: MapSelectionService = inject(MapSelectionService);
}
