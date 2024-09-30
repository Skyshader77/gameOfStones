import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Map } from '@app/interfaces/map';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { MapAPIService } from './map-api.service';
import { MapListService } from './map-list.service';

@Injectable({
    providedIn: 'root',
})
export class MapAdminService {
    private mapAPIService: MapAPIService = inject(MapAPIService);
    private mapListService: MapListService = inject(MapListService);
    private router: Router = inject(Router);

    delete(mapID: string, searchedMap: Map): Observable<{ id: string }> {
        return this.mapAPIService.deleteMap(mapID).pipe(
            tap(() => {
                this.mapListService.deleteMapOnUI(searchedMap);
            }),
            catchError((err) => {
                return throwError(() => new Error(err.message));
            }),
        );
    }
    goToEditMap(searchedMap: Map): Observable<Map> {
        return this.mapAPIService.getMapById(searchedMap._id).pipe(
            tap(() => {
                this.router.navigate(['/edit', searchedMap._id]);
            }),
            catchError((err) => {
                return throwError(() => new Error(err.message));
            }),
        );
    }

    modifyMap(searchedMap: Map): Observable<Map> {
        return this.mapAPIService.updateMap(searchedMap).pipe(
            tap(() => {
                this.mapListService.updateMapOnUI(searchedMap);
            }),
            catchError((err) => {
                return throwError(() => new Error(err.message));
            }),
        );
    }

    toggleVisibility(searchedMap: Map): Observable<Map> {
        const updatedMap = { ...searchedMap, isVisible: !searchedMap.isVisible };
        return this.mapAPIService.updateMap(updatedMap).pipe(
            tap(() => {
                this.mapListService.updateMapOnUI(updatedMap);
            }),
            catchError((err) => {
                return throwError(() => new Error(err.message));
            }),
        );
    }
}
