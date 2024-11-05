import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/communication-services/socket.service';
import { Gateway } from '@common/constants/gateway.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AvatarListService {
    avatarsTakenState: boolean[];
    selectedAvatar = new BehaviorSubject<Avatar>(0);
    constructor(private socketService: SocketService) {
        this.initializeAvatarList();
    }

    sendAvatarRequest(desiredAvatar: Avatar) {
        this.socketService.emit(Gateway.ROOM, RoomEvents.DesiredAvatar, desiredAvatar);
    }

    sendPlayerCreationFormOpened(roomId: string) {
        this.socketService.emit(Gateway.ROOM, RoomEvents.PlayerCreationOpened, roomId);
    }

    sendPlayerCreationClosed(roomId: string) {
        this.socketService.emit(Gateway.ROOM, RoomEvents.PlayerCreationClosed, roomId);
    }

    setSelectedAvatar(avatar: Avatar): void {
        this.selectedAvatar.next(avatar);
    }

    initializeAvatarList(): void {
        const avatarCount = Object.values(Avatar).filter((value) => typeof value === 'number').length;
        this.avatarsTakenState = Array(avatarCount).fill(false);
    }
}
