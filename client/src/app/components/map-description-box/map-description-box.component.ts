import { Component } from '@angular/core';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';

@Component({
    selector: 'app-map-description-box',
    standalone: true,
    imports: [],
    templateUrl: './map-description-box.component.html',
})
export class MapDescriptionBoxComponent {
    constructor(public mapSelectionService: MapSelectionService) {}
}
