import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { MapListService } from './map-list.service';
@Injectable({
    providedIn: 'root',
})
export class MapSelectionService {
    private MapListService: MapListService = inject(MapListService);
    private _loaded: boolean;
    private _selection: number;

    constructor() {
        this._loaded = false;
        this._selection = -1;
    }

    get selectedMap(): Map | null {
        return this._selection !== -1 ? this.MapListService.maps[this._selection] : null;
    }

    get loaded(): boolean {
        return this._loaded;
    }

    initialize(): void {
        this._loaded = false;
        this._selection = -1;
    }

    chooseSelectedMap(index: number): void {
        if (index >= 0 && index < this.MapListService.maps.length) {
            this._selection = index;
        }
    }
}
