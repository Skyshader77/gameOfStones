import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoomAPIService } from '@app/services/api-services/room-api.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { Player } from '@app/interfaces/player';
import { RoomStateService } from './room-state.service';

@Injectable({
    providedIn: 'root',
})
export class RoomJoiningService {
    playerToJoin: Player;
    constructor(
        private roomAPIService: RoomAPIService,
        private roomSocketService: RoomSocketService,
        private roomStateService: RoomStateService,
    ) {}

    get roomCode(): string {
        return this.roomStateService.roomCode;
    }

    set roomCode(roomCode: string) {
        this.roomStateService.roomCode = roomCode;
    }

    isValidInput(userInput: string): boolean {
        const regex = /^\d{4}$/;
        return regex.test(userInput);
    }

    doesRoomExist(input: string): Observable<boolean> {
        return this.roomAPIService.checkRoomExists(input);
    }

    requestJoinRoom(roomCode: string) {
        this.roomSocketService.requestJoinRoom(roomCode, this.playerToJoin);
    }

    handlePlayerCreationOpened(roomCode: string) {
        this.roomSocketService.handlePlayerCreationOpened(roomCode);
    }
}
