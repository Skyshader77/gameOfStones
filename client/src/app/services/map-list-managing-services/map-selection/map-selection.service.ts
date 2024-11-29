import { Injectable } from '@angular/core';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { Map } from '@common/interfaces/map';
@Injectable({
    providedIn: 'root',
})
export class MapSelectionService {
    private selection: number | null;

    constructor(private mapListService: MapListService) {
        this.initialize();
    }

    get selectedMap(): Map | null {
        return this.selection !== null && this.selection !== undefined ? this.mapListService.serviceMaps[this.selection] : null;
    }

    initialize(): void {
        this.selection = null;
        this.mapListService.initialize();
    }

    chooseSelectedMap(index: number): void {
        if (index >= 0 && index < this.mapListService.serviceMaps.length) {
            this.selection = index;
        }
    }

    chooseVisibleMap(index: number): void {
        let visibleCount = 0;
        this.mapListService.serviceMaps.forEach((map: Map, mapIndex: number) => {
            if (map.isVisible) {
                if (visibleCount === index) {
                    this.selection = mapIndex;
                }
                visibleCount++;
            }
        });
    }
}
