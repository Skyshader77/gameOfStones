import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreationMap, Map } from '@common/interfaces/map';
import { catchError, Observable, throwError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Api } from '@common/enums/api.enum';

@Injectable({
    providedIn: 'root',
})
export class MapAPIService {
    private readonly baseUrl: string = `${environment.serverUrl}api/${Api.Map}`;

    constructor(private _http: HttpClient) {}

    getMaps(): Observable<Map[]> {
        return this._http.get<Map[]>(this.baseUrl);
    }

    getMapById(id: string): Observable<Map> {
        const url = `${this.baseUrl}/${id}`;
        return this._http.get<Map>(url).pipe(catchError(this.handleError()));
    }

    getMapByName(name: string): Observable<Map> {
        const url = `${this.baseUrl}/name/${name}`;
        return this._http.get<Map>(url).pipe(catchError(this.handleError()));
    }

    createMap(newMap: CreationMap): Observable<{ id: string }> {
        return this._http.post<{ id: string }>(this.baseUrl, newMap).pipe(catchError(this.handleError()));
    }

    updateMap(isSameName: boolean, newMap: Map): Observable<Map> {
        const url = this.baseUrl;
        return this._http.patch<Map>(url, { isSameName, newMap }).pipe(catchError(this.handleError()));
    }

    deleteMap(id: string): Observable<{ id: string }> {
        const url = `${this.baseUrl}/${id}`;
        return this._http.delete<{ id: string }>(url).pipe(catchError(this.handleError()));
    }

    handleError(): (error: HttpErrorResponse) => Observable<never> {
        return (error: HttpErrorResponse) => {
            let errorMessage: string;
            if (error.error instanceof ErrorEvent) {
                errorMessage = `Erreur du client: ${error.error.message}`;
            } else if (error.error instanceof ProgressEvent) {
                errorMessage = "Le serveur n'est pas connecté";
            } else if (error.error.message) {
                errorMessage = error.error.message[0];
            } else {
                errorMessage = `Erreur du serveur: ${error.status} - ${error.error.error}`;
            }
            return throwError(() => new Error(errorMessage));
        };
    }

    checkMapByName(name: string): Observable<boolean> {
        const url = `${this.baseUrl}/name/${name}`;
        return this._http.get<Map>(url).pipe(
            map(() => true),
            catchError(() => of(false)),
        );
    }
}
