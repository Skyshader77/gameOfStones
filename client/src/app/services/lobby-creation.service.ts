import { inject, Injectable } from '@angular/core';
import { Map } from '@app/interfaces/map';
import { Room } from '@app/interfaces/room';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { MapAPIService } from './map-api.service';
import { MapSelectionService } from './map-selection.service';
import { RoomAPIService } from './room-api.service';
import { LOBBY_CREATION_STATUS } from '@app/constants/lobby.constants';

@Injectable({
    providedIn: 'root',
})
export class LobbyCreationService {
    private mapAPIService: MapAPIService = inject(MapAPIService);
    private mapSelectionService: MapSelectionService = inject(MapSelectionService);
    private roomAPIService: RoomAPIService = inject(RoomAPIService);
    private selectionStatus: string = '';

    get statusMessage(): string {
        return this.selectionStatus;
    }

    initialize(): void {
        this.mapSelectionService.initialize();
    }

    isMapSelected(): boolean {
        return this.mapSelectionService.selectedMap !== null;
    }

    isSelectionValid(): Observable<boolean> {
        const selectedMap: Map | null = this.mapSelectionService.selectedMap;

        if (!selectedMap) {
            this.selectionStatus = LOBBY_CREATION_STATUS.noSelection;
            return of(false);
        }

        return this.mapAPIService.getMapById(selectedMap._id).pipe(
            map((serverMap: Map) => {
                if (!serverMap.isVisible) {
                    this.selectionStatus = LOBBY_CREATION_STATUS.isNotVisible;
                    return false;
                } else {
                    this.selectionStatus = LOBBY_CREATION_STATUS.success;
                    return serverMap._id === selectedMap._id;
                }
            }),
            catchError(() => {
                this.selectionStatus = LOBBY_CREATION_STATUS.noLongerExists;
                return of(false);
            }),
        );
    }

    submitCreation(): Observable<Room | null> {
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
