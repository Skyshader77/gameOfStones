import { Injectable } from '@angular/core';
import { LOBBY_CREATION_STATUS } from '@app/constants/lobby.constants';
import { Map } from '@app/interfaces/map';
import { Room } from '@app/interfaces/room';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { RoomAPIService } from '@app/services/api-services/room-api.service';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyCreationService {
    private selectionStatus: string = '';

    constructor(
        private mapAPIService: MapAPIService,
        private mapSelectionService: MapSelectionService,
        private roomAPIService: RoomAPIService,
    ) {}

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
                return this.isMapValid(serverMap, selectedMap);
            }),
            catchError(() => {
                this.selectionStatus = LOBBY_CREATION_STATUS.noLongerExists;
                return of(false);
            }),
        );
    }

    submitCreation(): Observable<Room | null> {
        return this.isSelectionValid().pipe(concatMap((isValid) => (isValid ? this.roomAPIService.createRoom() : of(null))));
    }

    private isMapValid(serverMap: Map, selectedMap: Map): boolean {
        this.selectionStatus = serverMap.isVisible ? LOBBY_CREATION_STATUS.success : LOBBY_CREATION_STATUS.isNotVisible;

        return serverMap.isVisible ? serverMap._id === selectedMap._id : false;
    }
}
