import { Component } from '@angular/core';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection/map-selection.service';

@Component({
    selector: 'app-map-info',
    standalone: true,
    imports: [],
    templateUrl: './map-info.component.html',
})
export class MapInfoComponent {
    constructor(private mapSelectionService: MapSelectionService) {}

    get hasSelection(): boolean {
        return this.mapSelectionService.selectedMap !== null;
    }

    get imageData() {
        return this.mapSelectionService.selectedMap?.imageData;
    }

    get mapName() {
        return this.mapSelectionService.selectedMap?.name;
    }

    get mapDescription() {
        return this.mapSelectionService.selectedMap?.description;
    }

    get mapSize() {
        return this.mapSelectionService.selectedMap?.size;
    }

    get mapMode() {
        return this.mapSelectionService.selectedMap?.mode;
    }
}
