import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Map } from '@app/interfaces/map';
import { MapAPIService } from './map-api.service';

@Injectable({
    providedIn: 'root',
})
export class MapSelectionService {
    private mapAPIService: MapAPIService = inject(MapAPIService);
    private _router: Router = inject(Router);
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

    getMapsAPI(): void {
        this.mapAPIService.getMaps().subscribe({
            next: (maps) => {
                console.log(maps);
                this._maps = maps;
                this._loaded = true;
            },
            error: (error: Error) => {
                console.error(error);
            },
        });
    }

    initialize(): void {
        this._loaded = false;
        this.getMapsAPI();
        this._selection = -1;
    }

    chooseSelectedMap(index: number): void {
        if (index >= 0 && index < this._maps.length) {
            this._selection = index;
        }
    }

    goToEditMap(searchedMap: Map): void {
        this._router.navigate(['/edit'], { state: { map: searchedMap, isPresentInDatabase: true } });
    }
}
