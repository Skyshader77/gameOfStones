import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Room } from '@app/interfaces/room';
import { Observable, map, of, catchError } from 'rxjs';
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

    checkRoomExists(roomCode: string): Observable<boolean> {
        return this._http.get<Room>(`${this._baseUrl}/code/${roomCode}`).pipe(
            map((room) => !!room),
            catchError(() => of(false)),
        );
    }
}
