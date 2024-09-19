import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Room } from '@app/interfaces/room';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class RoomAPIService {
    private readonly _baseUrl: string = `${environment.serverUrl}api/Room`;
    constructor(private _http: HttpClient) {}

    createRoom(): Observable<Room> {
        return this._http.post<Room>(this._baseUrl, null);
    }
}
