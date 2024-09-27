import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { throwError } from 'rxjs';
import { MapAPIService } from './map-api.service';

@Injectable({
    providedIn: 'root',
})
export class MapListService {
    private mapAPIService: MapAPIService = inject(MapAPIService);
    private loaded: boolean;
    private maps: Map[];

    constructor() {
        this.loaded = false;
        this.maps = [];
    }

    get serviceMaps(): Map[] {
        return this.maps;
    }

    get isLoaded(): boolean {
        return this.loaded;
    }

    initialize(): void {
        this.getMapsAPI();
    }

    getMapsAPI(): void {
        this.mapAPIService.getMaps().subscribe({
            next: (maps) => {
                this.maps = maps;
                this.loaded = true;
            },
            error: (error: Error) => {
                return throwError(() => new Error(error.message));
            },
        });
    }

    deleteMapOnUI(searchedMap: Map): void {
        this.maps = this.maps.filter((map) => map !== searchedMap);
    }

    updateMapOnUI(updatedMap: Map): void {
        this.maps = this.maps.map((m) => (m._id === updatedMap._id ? updatedMap : m));
    }
}
