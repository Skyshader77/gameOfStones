import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreationMap, Map } from 'src/app/interfaces/map';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class MapAPIService {
    private readonly _baseUrl: string = `${environment.serverUrl}api/Map`;

    constructor(private _http: HttpClient) {}

    getMaps(): Observable<Map[]> {
        return this._http.get<Map[]>(this._baseUrl).pipe(catchError(this.handleError<Map[]>('getMaps')));
    }

    getMapById(id: string): Observable<Map> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.get<Map>(url).pipe(catchError(this.handleError<Map>('getMapbyId')));
    }

    getMapByName(name: string): Observable<Map> {
        const url = `${this._baseUrl}/name/${name}`;
        return this._http.get<Map>(url).pipe(catchError(this.handleError<Map>('getMapbyName')));
    }

    createMap(newmap: CreationMap): Observable<CreationMap> {
        return this._http.post<Map>(this._baseUrl, newmap).pipe(catchError(this.handleError<CreationMap>('createMap')));
    }

    updateMap(id: string, map: CreationMap): Observable<Map> {
        const url = this._baseUrl;
        return this._http.patch<Map>(url, map).pipe(catchError(this.handleError<Map>('updateMap')));
    }

    deleteMap(id: string): Observable<null> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.delete<null>(url).pipe(catchError(this.handleError<null>('deleteMap')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
