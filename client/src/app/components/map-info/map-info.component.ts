import { Component } from '@angular/core';
import { MODE_DESCRIPTIONS, UNKNOWN_TEXT } from '@app/constants/conversion.constants';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection/map-selection.service';
import { MODE_NAMES } from '@common/constants/game-map.constants';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-map-info',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './map-info.component.html',
})
export class MapInfoComponent {
    circleInfoIcon = faCircleInfo;

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
            return UNKNOWN_TEXT;
        }
        const mode = this.mapSelectionService.selectedMap?.mode;
        return MODE_NAMES[mode];
    }

    getModeDescription(mode: string): string {
        return MODE_DESCRIPTIONS[mode] || UNKNOWN_TEXT;
    }
}
