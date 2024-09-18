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
            next: (maps: Map[]) => {
                this._maps = maps;
                this._loaded = true;
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

    delete(searchedMap: Map): void {
        this.mapAPIService.deleteMap(searchedMap._id).subscribe();
        this._maps = this._maps.filter((map) => map !== searchedMap);
    }

    goToEditMap(searchedMap: Map): void {
        this._router.navigate(['/edit'], { state: searchedMap });
    }

    modifyMap(searchedMap: Map): void {
        this.mapAPIService.updateMap(searchedMap._id, searchedMap).subscribe({
            next: () => {
                this.getMapsAPI();
            },
        });
    }

    toggleVisibility(searchedMap: Map): void {
        const updatedMap = { ...searchedMap, isVisible: !searchedMap.isVisible };
        this.mapAPIService.updateMap(searchedMap._id, updatedMap).subscribe({
            next: () => {
                this._maps = this._maps.map((m) => (m._id === searchedMap._id ? updatedMap : m));
            },
        });
    }
}
