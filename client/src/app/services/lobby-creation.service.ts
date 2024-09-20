import { inject, Injectable } from '@angular/core';
import { LOBBY_CREATION_STATUS } from '@app/interfaces/lobby-creation';
import { Map } from '@app/interfaces/map';
import { Room } from '@app/interfaces/room';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
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
    private _selectionStatus: string = '';

    get selectionStatus(): string {
        return this._selectionStatus;
    }

    initialize(): void {
        this.mapSelectionService.initialize();
    }

    isSelectionMaybeValid(): boolean {
        return this.mapSelectionService.selectedMap !== null;
    }

    isSelectionValid(): Observable<boolean> {
        const selectedMap: Map | null = this.mapSelectionService.selectedMap;

        if (!selectedMap) {
            this._selectionStatus = LOBBY_CREATION_STATUS.noSelection;
            return of(false);
        }

        return this.mapAPIService.getMapbyId(selectedMap._id).pipe(
            map((serverMap: Map) => {
                if (!serverMap.isVisible) {
                    this._selectionStatus = LOBBY_CREATION_STATUS.isNotVisible;
                    return false;
                } else {
                    this._selectionStatus = LOBBY_CREATION_STATUS.success;
                    return serverMap._id === selectedMap._id;
                }
            }),
            catchError(() => {
                this._selectionStatus = LOBBY_CREATION_STATUS.noLongerExists;
                return of(false);
            }),
        );
    }

    submitCreation(): Observable<Room | null> {
        // TODO need to do the map validation
        return this.isSelectionValid().pipe(
            concatMap((isValid: boolean) => {
                if (!isValid) {
                    return of(null);
                } else {
                    return this.roomAPIService.createRoom();
                }
            }),
        );
    }
}
