import { Injectable } from '@angular/core';
import { Gateway } from '@common/constants/gateway.constants';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { Subscription } from 'rxjs';
import { SocketService } from '../communication-services/socket.service';
import { AvatarChoice } from '@common/constants/player.constants';
import { AvatarData } from '@common/interfaces/avatar-data';
@Injectable({
    providedIn: 'root',
})
export class AvatarListService {
    avatarList: boolean[];
    selectedAvatar: AvatarChoice = 0;
    constructor(private socketService: SocketService) {
        this.initializeAvatarList();
    }

    listenAvatarList(): Subscription {
        return this.socketService.on<AvatarData>(Gateway.ROOM, RoomEvents.AvailableAvatars).subscribe((avatarData) => {
            console.log('updated');
            console.log(avatarData.avatarList);
            this.avatarList = avatarData.avatarList;
            this.selectedAvatar = avatarData.selectedAvatar;
        });
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
