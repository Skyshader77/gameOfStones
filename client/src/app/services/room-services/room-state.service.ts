import { Injectable } from '@angular/core';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { Room } from '@common/interfaces/room';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RoomStateService {
    playerLimitReached: boolean;
    private currentRoom: Room = { roomCode: '', isLocked: false };
    private roomLockedListener: Subscription;
    private playerLimitListener: Subscription;

    constructor(private roomSocketService: RoomSocketService) {}

    get roomCode(): string {
        return this.currentRoom.roomCode;
    }

    get isLocked(): boolean {
        return this.currentRoom.isLocked;
    }

    set roomCode(newCode: string) {
        this.currentRoom.roomCode = newCode;
    }

    initialize() {
        this.roomLockedListener = this.roomSocketService.listenForRoomLocked().subscribe((isLocked) => {
            this.currentRoom.isLocked = isLocked;
        });

        this.playerLimitListener = this.roomSocketService.listenForPlayerLimit().subscribe((isLimitReached) => {
            this.playerLimitReached = isLimitReached;
        });
    }

    onCleanUp() {
        this.roomLockedListener.unsubscribe();
        this.playerLimitListener.unsubscribe();

        this.playerLimitReached = false;
        this.currentRoom = { roomCode: '', isLocked: false };
    }
}
