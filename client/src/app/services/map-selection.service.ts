import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { MapAPIService } from './map-api.service';

@Injectable({
    providedIn: 'root',
})
export class MapSelectionService {
    private mapAPIService: MapAPIService = inject(MapAPIService);

    private _loaded: boolean;
    private _maps: Map[];
    private _selection: number;

    constructor() {
        this._loaded = false;
        this._selection = -1;
        this._maps = [];
    }

    get selectedMap(): Map | null {
        return this._selection !== -1 ? this._maps[this._selection] : null;
    }

    get maps(): Map[] {
        return this._maps;
    }

    get loaded(): boolean {
        return this._loaded;
    }

    initialize(): void {
        this._loaded = false;
        this.mapAPIService.getMaps().subscribe({
            next: (maps: Map[]) => {
                this._maps = maps;
                this._loaded = true;
            },
        });
        this._selection = -1;
    }

    chooseSelectedMap(index: number): void {
        if (index >= 0 && index < this._maps.length) {
            this._selection = index;
        }
    }
}
