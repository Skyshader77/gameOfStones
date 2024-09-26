import { Map } from '@app/interfaces/map';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { MapAPIService } from './map-api.service';
import { MapListService } from './map-list.service';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class MapAdminService{
  private mapAPIService: MapAPIService = inject(MapAPIService);
  private mapListService: MapListService = inject(MapListService );
  private _router: Router = inject(Router);

  constructor() { 

  }

  delete(searchedMap: Map): Observable<{id:string}> {
    return this.mapAPIService.deleteMap(searchedMap._id).pipe(
        tap(() => {
          this.mapListService.getMapsAPI();
        }),
        catchError((err) => {
            return throwError(() => new Error(err.message));
        }),
    );
  }

  goToEditMap(searchedMap: Map): void {
    this._router.navigate(['/edit'], { state: { map: searchedMap, isPresentInDatabase: true } });
  }

  modifyMap(searchedMap: Map): Observable<Map> {
    return this.mapAPIService.updateMap(searchedMap).pipe(
        tap(() => {
          this.mapListService.getMapsAPI();
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
            this.mapListService.getMapsAPI();
        }),
        catchError((err) => {
            return throwError(() => new Error(err.message));
        }),
    );
  }

}

