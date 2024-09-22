import { Component, inject, Input } from '@angular/core';
import { MapSelectionService } from '@app/services/map-selection.service';

@Component({
    selector: 'app-map-description-box',
    standalone: true,
    imports: [],
    templateUrl: './map-description-box.component.html',
})
export class MapDescriptionBoxComponent {
    @Input() isHover = false;
    mapSelectionService: MapSelectionService = inject(MapSelectionService);
}
