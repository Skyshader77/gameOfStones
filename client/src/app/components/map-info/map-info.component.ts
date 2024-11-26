import { Component } from '@angular/core';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';
import { MODE_NAMES } from '@common/constants/game-map.constants';

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
        return MODE_NAMES[mode ?? -1] || 'Inconnu';
    }
}
