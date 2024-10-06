import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Map } from '@app/interfaces/map';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { MapListService } from '@app/services/map-list-managing-services/map-list.service';

@Injectable({
    providedIn: 'root',
})
export class MapAdminService {
    constructor(
        private mapAPIService: MapAPIService,
        private mapListService: MapListService,
        private router: Router,
    ) {}

    editMap(searchedMap: Map): Observable<Map> {
        return this.mapAPIService.getMapById(searchedMap._id).pipe(
            tap(() => {
                this.router.navigate(['/edit', searchedMap._id]);
            }),
            catchError((err) => throwError(() => new Error(err.message))),
        );
    }

    deleteMap(mapID: string, searchedMap: Map): Observable<{ id: string }> {
        return this.mapAPIService.deleteMap(mapID).pipe(
            tap(() => this.mapListService.deleteMapOnUI(searchedMap)),
            catchError((err) => throwError(() => new Error(err.message))),
        );
    }

    toggleVisibilityMap(searchedMap: Map): Observable<Map> {
        const updatedMap = { ...searchedMap, isVisible: !searchedMap.isVisible };
        return this.mapAPIService.updateMap(updatedMap).pipe(
            tap(() => this.mapListService.updateMapOnUI(updatedMap)),
            catchError((err) => throwError(() => new Error(err.message))),
        );
    }
}
