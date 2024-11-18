import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/communication-services/socket.service';
import { Avatar } from '@common/enums/avatar.enum';
import { Gateway } from '@common/enums/gateway.enum';
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
        this.socketService.emit(Gateway.Room, RoomEvents.DesiredAvatar, desiredAvatar);
    }

    sendPlayerCreationFormOpened(roomId: string) {
        this.socketService.emit(Gateway.Room, RoomEvents.PlayerCreationOpened, roomId);
    }

    sendPlayerCreationClosed(roomId: string) {
        this.socketService.emit(Gateway.Room, RoomEvents.PlayerCreationClosed, roomId);
    }

    setSelectedAvatar(avatar: Avatar): void {
        this.selectedAvatar.next(avatar);
    }

    initializeAvatarList(): void {
        const avatarCount = Object.values(Avatar).filter((value) => typeof value === 'number').length;
        this.avatarsTakenState = Array(avatarCount).fill(false);
    }
}
