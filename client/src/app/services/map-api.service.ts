import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Map, MapCreate } from 'src/app/interfaces/map';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class MapAPIService {
    private readonly _baseUrl: string = `${environment.serverUrl}api/Map`;

    constructor(private _http: HttpClient) {}

    getMaps(): Observable<Map[]> {
        return this._http.get<Map[]>(this._baseUrl);
    }

    getMapbyId(id: string): Observable<Map> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.get<Map>(url).pipe(
            catchError((this.handleError()),
        ));
    }

    getMapbyName(name: string): Observable<Map> {
        const url = `${this._baseUrl}/name/${name}`;
        return this._http.get<Map>(url).pipe(
            catchError((this.handleError()),
        ));
    }

    createMap(newMap: MapCreate): Observable<{ id: string }> {
        return this._http.post<{ id: string }>(this._baseUrl, newMap).pipe(
            catchError((this.handleError()),
        ));
    }

    updateMap(map: Map): Observable<Map> {
        const url = this._baseUrl;
        return this._http.patch<Map>(url, map).pipe(
            catchError((this.handleError()),
        ));
    }

    deleteMap(id: string): Observable<{ id: string }> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.delete<{ id: string }>(url).pipe(
            catchError((this.handleError()),
        ));
    }

    private handleError(): (error: HttpErrorResponse) => Observable<never> {
        return (error: HttpErrorResponse) => {
            return throwError(() => new Error(error.error.error));
        };
    }

}
