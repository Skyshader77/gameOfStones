import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { MapListService } from './map-list.service';
@Injectable({
    providedIn: 'root',
})
export class MapSelectionService {
    private mapListService: MapListService = inject(MapListService);
    selection: number;

    constructor() {
        this.selection = -1;
    }

    get selectedMap(): Map | null {
        return this.selection !== -1 ? this.mapListService.serviceMaps[this.selection] : null;
    }

    initialize(): void {
        this.selection = -1;
    }

    chooseSelectedMap(index: number): void {
        if (index >= 0 && index < this.mapListService.serviceMaps.length) {
            this.selection = index;
        }
    }
}
