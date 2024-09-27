import { Component, inject } from '@angular/core';
import { MapListService } from '@app/services/map-list.service';
import { MapSelectionService } from '@app/services/map-selection.service';
@Component({
    selector: 'app-map-list',
    standalone: true,
    imports: [],
    templateUrl: './map-list.component.html',
})
export class MapListComponent {
    mapSelectionService: MapSelectionService = inject(MapSelectionService);
    mapListService: MapListService = inject(MapListService);
    onSelectMap(event: MouseEvent): void {
        const element: HTMLElement = event.target as HTMLElement;
        if (element.tagName.toLowerCase() === 'span') {
            this.mapSelectionService.chooseSelectedMap(parseInt(element.id.substring('map'.length), 10));
        }
    }
}
