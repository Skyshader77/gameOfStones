import { Component } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { MapListService } from '@app/services/map-list-managing-services/map-list.service';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';
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
    ) {}

    get visibleMaps(): Map[] {
        return this.mapListService.serviceMaps.filter((map: Map) => map.isVisible);
    }

    onSelectMap(event: MouseEvent): void {
        const element: HTMLElement = event.target as HTMLElement;
        if (element.tagName.toLowerCase() === 'span') {
            this.mapSelectionService.chooseVisibleMap(parseInt(element.id.substring('map'.length), 10));
        }
    }
}
