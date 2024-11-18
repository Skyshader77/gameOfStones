import { Component } from '@angular/core';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';

@Component({
    selector: 'app-map-info',
    standalone: true,
    imports: [],
    templateUrl: './map-info.component.html',
})
export class MapInfoComponent {
    constructor(public mapSelectionService: MapSelectionService) {}

    getMapMode(): string {
        const mode = this.mapSelectionService.selectedMap?.mode;
        return mode === 0 ? 'Normal' : mode === 1 ? 'Capture du Drapeau' : 'Inconnu';
    }
}
