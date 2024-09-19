import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { Room } from '@app/interfaces/room';
import { catchError, map, Observable, of } from 'rxjs';
import { MapAPIService } from './map-api.service';
import { MapSelectionService } from './map-selection.service';
import { RoomAPIService } from './room-api.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyCreationService {
    private mapAPIService: MapAPIService = inject(MapAPIService);
    private mapSelectionService: MapSelectionService = inject(MapSelectionService);
    private roomAPIService: RoomAPIService = inject(RoomAPIService);
    private _selectionError: string;

    get selectionError(): string {
        return this._selectionError;
    }

    initialize(): void {
        this.mapSelectionService.initialize();
        this._selectionError = '';
    }

    isSelectionValid(): Observable<boolean> {
        const selectedMap: Map | null = this.mapSelectionService.selectedMap;

        if (!selectedMap) {
            this._selectionError = 'Aucune carte a été sélectionnée!';
            return of(false);
        }

        return this.mapAPIService.getMapbyId(selectedMap._id).pipe(
            map((serverMap: Map) => {
                return serverMap._id === selectedMap._id; // TODO && map.isVisible;
            }),
            catchError(() => {
                this._selectionError = "La carte sélectionnée n'existe plus!";
                return of(false);
            }),
        );
    }

    submitCreation(): Observable<Room | null> {
        // TODO need to do the map validation
        return this.roomAPIService.createRoom().pipe(
            map((room: Room) => {
                return room;
            }),
        );
    }
}
