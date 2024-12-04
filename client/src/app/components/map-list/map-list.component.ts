import { Component } from '@angular/core';
import { RADIX } from '@app/constants/edit-page.constants';
import { Sfx } from '@app/interfaces/sfx';
import { AudioService } from '@app/services/audio/audio.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection/map-selection.service';
import { Map } from '@common/interfaces/map';
@Component({
    selector: 'app-map-list',
    standalone: true,
    imports: [],
    templateUrl: './map-list.component.html',
})
export class MapListComponent {
    constructor(
        public mapSelectionService: MapSelectionService,
        public mapListService: MapListService,
        private audioService: AudioService,
    ) {}

    get visibleMaps(): Map[] {
        return this.mapListService.serviceMaps.filter((map: Map) => map.isVisible);
    }

    get isLoaded(): boolean {
        return this.mapListService.isLoaded;
    }

    isMapSelected(map: Map) {
        return map === this.mapSelectionService.selectedMap;
    }

    onSelectMap(event: MouseEvent): void {
        this.audioService.playSfx(Sfx.ButtonClicked);
        const element: HTMLElement = event.target as HTMLElement;
        if (element.tagName.toLowerCase() === 'span') {
            this.mapSelectionService.chooseVisibleMap(parseInt(element.id.substring('map'.length), RADIX));
        }
    }
}
