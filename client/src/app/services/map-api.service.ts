import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
        return this._http.get<Map>(url);
    }

    getMapbyName(name: string): Observable<Map> {
        const url = `${this._baseUrl}/name/${name}`;
        return this._http.get<Map>(url);
    }

    createMap(newmap: MapCreate): Observable<MapCreate> {
        return this._http.post<Map>(this._baseUrl, newmap);
    }

    updateMap(id: string, map: Map): Observable<Map> {
        const url = this._baseUrl;
        return this._http.patch<Map>(url, map);
    }

    deleteMap(id: string): Observable<null> {
        const url = `${this._baseUrl}/${id}`;
        return this._http.delete<null>(url);
    }
}
