import { Component, inject } from '@angular/core';
import { MapSelectionService } from '@app/services/map-selection.service';

@Component({
    selector: 'app-map-description-box',
    standalone: true,
    imports: [],
    templateUrl: './map-description-box.component.html',
})
export class MapDescriptionBoxComponent {
    isHovered: boolean = false;
    mapSelectionService: MapSelectionService = inject(MapSelectionService);
}
