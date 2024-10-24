import { Injectable } from '@angular/core';
import { ROOM_CREATION_STATUS } from '@app/constants/room.constants';
import { Map } from '@app/interfaces/map';
import { Player } from '@app/interfaces/player';
import { Room } from '@app/interfaces/room';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { RoomAPIService } from '@app/services/api-services/room-api.service';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';

@Injectable({
    providedIn: 'root',
})
export class RoomCreationService {
    constructor(
        private mapAPIService: MapAPIService,
        private mapSelectionService: MapSelectionService,
        private roomAPIService: RoomAPIService,
        private roomSocketService: RoomSocketService,
        private modalMessageService: ModalMessageService,
    ) {}

    initialize(): void {
        this.mapSelectionService.initialize();
    }

    isMapSelected(): boolean {
        return this.mapSelectionService.selectedMap !== null;
    }

    isSelectionValid(): Observable<boolean> {
        const selectedMap: Map | null = this.mapSelectionService.selectedMap;

        if (!selectedMap) {
            this.modalMessageService.showMessage({ title: ROOM_CREATION_STATUS.noSelection, content: '' });
            return of(false);
        }

        return this.mapAPIService.getMapById(selectedMap._id).pipe(
            map((serverMap: Map) => {
                return this.isMapValid(serverMap, selectedMap);
            }),
            catchError((error: Error) => {
                this.modalMessageService.showMessage({ title: ROOM_CREATION_STATUS.noLongerExists, content: error.message });
                return of(false);
            }),
        );
    }

    handleRoomCreation(player: Player, roomCode: string, roomMap: Map) {
        this.roomSocketService.createRoom(roomCode, roomMap);
        this.roomSocketService.joinRoom(roomCode, player);
    }

    submitCreation(): Observable<{ room: Room | null; selectedMap: Map | null }> {
        return this.isSelectionValid().pipe(
            concatMap((isValid) => {
                if (isValid) {
                    return this.roomAPIService.createRoom().pipe(map((room: Room) => ({ room, selectedMap: this.mapSelectionService.selectedMap })));
                }
                return of({ room: null, selectedMap: null });
            }),
        );
    }

    private isMapValid(serverMap: Map, selectedMap: Map): boolean {
        if (!serverMap.isVisible) {
            this.modalMessageService.showMessage({
                title: ROOM_CREATION_STATUS.isNotVisible,
                content: '',
            });
        }

        return serverMap.isVisible ? serverMap._id === selectedMap._id : false;
    }
}
