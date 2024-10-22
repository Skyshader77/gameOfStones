import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoomAPIService } from '@app/services/api-services/room-api.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { Player } from '@app/interfaces/player';

@Injectable({
    providedIn: 'root',
})
export class RoomJoiningService {
    constructor(
        private roomAPIService: RoomAPIService,
        private roomSocketService: RoomSocketService,
    ) {}

    isValidInput(input: string): boolean {
        const regex = /^\d{4}$/;
        return regex.test(input);
    }

    isIDValid(input: string): Observable<boolean> {
        return this.roomAPIService.checkRoomExists(input);
    }

    joinRoom(roomCode: string, player: Player) {
        this.roomSocketService.joinRoom(roomCode, player);
    }
}
