import { Injectable } from '@angular/core';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RoomStateService {
    isLocked: boolean = false;
    private roomLockedListener: Subscription;

    constructor(private roomSocketService: RoomSocketService) {
        this.roomLockedListener = this.roomSocketService.listenForToggleLock().subscribe((isLocked) => {
            this.isLocked = isLocked;
        });
    }

    onCleanUp() {
        this.roomLockedListener.unsubscribe();
    }
}
