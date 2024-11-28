import { Component } from '@angular/core';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection/map-selection.service';
import { MODE_NAMES } from '@common/constants/game-map.constants';

@Component({
    selector: 'app-map-info',
    standalone: true,
    imports: [],
    templateUrl: './map-info.component.html',
})
export class MapInfoComponent {
    constructor(private mapSelectionService: MapSelectionService) {}

    get hasSelection(): boolean {
        return Boolean(this.mapSelectionService.selectedMap);
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

    get mapMode(): string {
        if (!this.mapSelectionService.selectedMap) {
            return 'Inconnu';
        }
        const mode = this.mapSelectionService.selectedMap?.mode;
        return MODE_NAMES[mode];
    }
}
