import { Injectable } from '@angular/core';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RoomStateService {
    isLocked: boolean;
    playerLimitReached: boolean;
    roomLockedListener: Subscription;
    playerLimitListener: Subscription;

    constructor(private roomSocketService: RoomSocketService) {}

    initialize() {
        this.roomLockedListener = this.roomSocketService.listenForRoomLocked().subscribe((isLocked) => {
            this.isLocked = isLocked;
        });

        this.playerLimitListener = this.roomSocketService.listenForPlayerLimit().subscribe((isLimitReached) => {
            this.playerLimitReached = isLimitReached;
        });
    }

    onCleanUp() {
        this.roomLockedListener.unsubscribe();
        this.isLocked = false;
    }
}
