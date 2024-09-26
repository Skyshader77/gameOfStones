import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Map } from '@app/interfaces/map';
import { catchError, Observable, tap, throwError } from 'rxjs';
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

    delete(searchedMap: Map): Observable<null> {
        return this.mapAPIService.deleteMap(searchedMap._id).pipe(
            tap(() => {
                this._maps = this._maps.filter((map) => map !== searchedMap);
            }),
            catchError((err) => {
                return throwError(() => new Error(err.message));
            }),
        );
    }

    goToEditMap(searchedMap: Map): void {
        this._router.navigate(['/edit'], { state: { map: searchedMap, isPresentInDatabase: true } });
    }

    modifyMap(searchedMap: Map): Observable<void> {
        return this.mapAPIService.updateMap(searchedMap).pipe(
            tap(() => {
                this.getMapsAPI();
            }),
            catchError((err) => {
                return throwError(() => new Error(err.message));
            }),
        );
    }

    toggleVisibility(searchedMap: Map): Observable<void> {
        const updatedMap = { ...searchedMap, isVisible: !searchedMap.isVisible };
        return this.mapAPIService.updateMap(updatedMap).pipe(
            tap(() => {
                this._maps = this._maps.map((m) => (m._id === searchedMap._id ? updatedMap : m));
            }),
            catchError((err) => {
                return throwError(() => new Error(err.message));
            }),
        );
    }
}
