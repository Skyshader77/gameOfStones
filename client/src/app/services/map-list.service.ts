import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { MapAPIService } from './map-api.service';

@Injectable({
    providedIn: 'root',
})
export class MapListService {
    private mapAPIService: MapAPIService = inject(MapAPIService);
    private _loaded: boolean;
    private _maps: Map[];

    constructor() {
        this._loaded = false;
        this._maps = [];
    }

    get maps(): Map[] {
        return this._maps;
    }

    get loaded(): boolean {
        return this._loaded;
    }
    
    initialize(): void {
        this.getMapsAPI();
    }

    getMapsAPI(): void {
        this.mapAPIService.getMaps().subscribe({
            next: (maps) => {
                this._maps = maps;
                this._loaded = true;
            },
            error: (error: Error) => {
                console.error(error);
            },
        });
    }
}
