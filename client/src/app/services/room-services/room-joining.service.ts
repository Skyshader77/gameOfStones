import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoomAPIService } from '@app/services/api-services/room-api.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { Player } from '@app/interfaces/player';

@Injectable({
    providedIn: 'root',
})
export class RoomJoiningService {
    storedPlayer: Player;
    constructor(
        private roomAPIService: RoomAPIService,
        private roomSocketService: RoomSocketService,
    ) {}

    isValidInput(userInput: string): boolean {
        const regex = /^\d{4}$/;
        return regex.test(userInput);
    }

    doesRoomExist(input: string): Observable<boolean> {
        return this.roomAPIService.checkRoomExists(input);
    }

    requestJoinRoom(roomCode: string) {
        this.roomSocketService.requestJoinRoom(roomCode, this.storedPlayer);
    }

    handlePlayerCreationOpened(roomCode: string) {
        this.roomSocketService.handlePlayerCreationOpened(roomCode);
    }
}
