import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorResponse } from '@app/interfaces/error';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Map, MapCreate } from 'src/app/interfaces/map';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class MapAPIService {
    private readonly _baseUrl: string = `${environment.serverUrl}api/Map`;

    constructor(private _http: HttpClient) {}

    getMaps(): Observable<Map[] | ErrorResponse> {
        return this._http.get<Map[]>(this._baseUrl).pipe(catchError(this.handleError));
    }

    getMapbyId(id: string): Observable<Map | ErrorResponse> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.get<Map>(url).pipe(catchError(this.handleError));
    }

    getMapbyName(name: string): Observable<Map | ErrorResponse> {
        const url = `${this._baseUrl}/name/${name}`;
        return this._http.get<Map>(url).pipe(catchError(this.handleError));
    }

    createMap(newMap: MapCreate): Observable<{ id: string } | ErrorResponse> {
        return this._http.post<{ id: string }>(this._baseUrl, newMap).pipe(catchError(this.handleError));
    }

    updateMap(map: Map): Observable<Map | ErrorResponse> {
        const url = this._baseUrl;
        return this._http.patch<Map>(url, map).pipe(catchError(this.handleError));
    }

    deleteMap(id: string): Observable<{ id: string } | ErrorResponse> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.delete<{ id: string }>(url).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse): Observable<ErrorResponse> {
        return of({ message: error.error, codeStatus: error.status });
    }
}
