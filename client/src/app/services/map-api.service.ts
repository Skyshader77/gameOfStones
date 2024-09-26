import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Map } from 'src/app/interfaces/map';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class MapAPIService {
    private readonly _baseUrl: string = `${environment.serverUrl}api/Map`;

    constructor(private _http: HttpClient) {}

    getMaps(): Observable<Map[]> {
        return this._http.get<Map[]>(this._baseUrl).pipe(catchError(this.handleGetError<Map[]>('getMaps')));
    }

    getMapbyId(id: string | undefined): Observable<Map> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.get<Map>(url).pipe(catchError(this.handleError('getMapbyId')));
    }

    getMapbyName(name: string): Observable<Map> {
        const url = `${this._baseUrl}/name/${name}`;
        return this._http.get<Map>(url).pipe(catchError(this.handleError('getMapbyName')));
    }

    createMap(newmap: Map): Observable<string> {
        return this._http.post<string>(this._baseUrl, newmap).pipe(catchError(this.handleError('createMap')));
    }

    updateMap(map: Map): Observable<void> {
        return this._http.patch<void>(this._baseUrl, map).pipe(catchError(this.handleError('updateMap')));
    }

    deleteMap(id: string | undefined): Observable<null> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.delete<null>(url).pipe(catchError(this.handleError('deleteMap')));
    }

    private handleGetError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }

    private handleError(operation: string): (error: HttpErrorResponse) => Observable<never> {
        return (error: HttpErrorResponse) => {
            let errorMessage = `Error in ${operation}: `;
            if (error.status === 0) {
                errorMessage += 'Server-side error: Unable to connect to the server. Please check your internet connection.';
            } else {
                errorMessage += `Status Code ${error.status}, Message: ${error.message}`;
            }
            return throwError(() => new Error(errorMessage));
        };
    }
}
