import { Injectable } from '@angular/core';
import { Gateway } from '@common/constants/gateway.constants';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { SocketService } from '../communication-services/socket.service';
import { AvatarChoice } from '@common/constants/player.constants';

@Injectable({
    providedIn: 'root',
})
export class AvatarListService {
    avatarList: boolean[];
    selectedAvatar: AvatarChoice = 0;
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

    initializeAvatarList(): void {
        this.avatarList = Array(Object.keys(AvatarChoice).length).fill(false);
        this.avatarList[0] = true;
    }
}
