import { Component, inject, Input } from '@angular/core';
import { MapSelectionService } from '@app/services/map-selection.service';

@Component({
    selector: 'app-map-info',
    standalone: true,
    imports: [],
    templateUrl: './map-info.component.html',
})
export class MapInfoComponent {
    @Input() adminInfo = false;
    mapSelectionService: MapSelectionService = inject(MapSelectionService);
}
