import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { MapListService } from './map-list.service';
@Injectable({
    providedIn: 'root',
})
export class MapSelectionService {
    selection: number;
    private mapListService: MapListService = inject(MapListService);

    constructor() {
        this.initialize();
    }

    get selectedMap(): Map | null {
        return this.selection !== -1 ? this.mapListService.serviceMaps[this.selection] : null;
    }

    initialize(): void {
        this.selection = -1;
        this.mapListService.initialize();
    }

    chooseSelectedMap(index: number): void {
        if (index >= 0 && index < this.mapListService.serviceMaps.length) {
            this.selection = index;
        }
    }
}
