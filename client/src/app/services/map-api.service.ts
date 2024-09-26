import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CreationMap, Map } from 'src/app/interfaces/map';
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

    getMapById(id: string): Observable<Map> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.get<Map>(url).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => new Error(error.error.error));
            }),
        );
    }

    getMapByName(name: string): Observable<Map> {
        const url = `${this._baseUrl}/name/${name}`;
        return this._http.get<Map>(url);
    }

    createMap(newMap: CreationMap): Observable<{ id: string }> {
        return this._http.post<{ id: string }>(this._baseUrl, newMap);
    }

    updateMap(map: Map): Observable<Map> {
        const url = this._baseUrl;
        return this._http.patch<Map>(url, map);
    }

    deleteMap(id: string): Observable<{ id: string }> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.delete<{ id: string }>(url);
    }
}
