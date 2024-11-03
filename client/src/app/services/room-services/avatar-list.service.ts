import { Injectable } from '@angular/core';
import { Gateway } from '@common/constants/gateway.constants';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { SocketService } from '@app/services/communication-services/socket.service';
import { AvatarChoice } from '@common/constants/player.constants';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AvatarListService {
    avatarTakenStateList: boolean[];
    selectedAvatar = new BehaviorSubject<AvatarChoice>(0);
    constructor(private socketService: SocketService) {
        this.initializeAvatarList();
    }

    sendAvatarRequest(desiredAvatar: AvatarChoice) {
        this.socketService.emit(Gateway.ROOM, RoomEvents.DesiredAvatar, desiredAvatar);
    }

    sendPlayerCreationFormOpened(roomId: string) {
        this.socketService.emit(Gateway.ROOM, RoomEvents.PlayerCreationOpened, roomId);
    }

    sendPlayerCreationClosed(roomId: string) {
        this.socketService.emit(Gateway.ROOM, RoomEvents.PlayerCreationClosed, roomId);
    }

    setSelectedAvatar(avatar: AvatarChoice): void {
        this.selectedAvatar.next(avatar);
    }

    initializeAvatarList(): void {
        const avatarCount = Object.values(AvatarChoice).filter((value) => typeof value === 'number').length;
        this.avatarTakenStateList = Array(avatarCount).fill(false);
    }
}
