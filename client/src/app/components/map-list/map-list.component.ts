import { Component, inject } from '@angular/core';
import { MapListService } from '@app/services/map-list.service';

@Component({
    selector: 'app-map-list',
    standalone: true,
    imports: [],
    templateUrl: './map-list.component.html',
})
export class MapListComponent {
    loading: boolean = false;

    mapListService: MapListService = inject(MapListService);

    onSelectMap(event: MouseEvent): void {
        const element: HTMLElement = event.target as HTMLElement;
        if (element.tagName.toLowerCase() === 'span') {
            this.mapListService.chooseSelectedMap(parseInt(element.id.substring('map'.length), 10));
        }
    }
}
