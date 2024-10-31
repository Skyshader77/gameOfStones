import { Injectable } from '@angular/core';
import { AVATARS } from '@app/constants/player.constants';
import { Gateway } from '@common/constants/gateway.constants';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { Subscription } from 'rxjs';
import { SocketService } from '../communication-services/socket.service';
@Injectable({
  providedIn: 'root'
})
export class AvatarListService {
  //avatarList:Map<string, boolean>;
  avatarList: Map<string, boolean> = new Map<string, boolean>([
    [AVATARS[0], false],
    [AVATARS[1], false],
    [AVATARS[2], false],
    [AVATARS[3], false],
    [AVATARS[4], false],
    [AVATARS[5], false],
    [AVATARS[6], false],
    [AVATARS[7], false],
    [AVATARS[8], false],
    [AVATARS[9], true],
    [AVATARS[10], true],
    [AVATARS[11], true],
]);
  constructor(private socketService: SocketService) { 
  }

  listenAvatarList(): Subscription {
    return this.socketService.on<Map<string, boolean>>(Gateway.ROOM, RoomEvents.AvailableAvatars).subscribe((avatarList) => {
        this.avatarList = avatarList;
    });
  }

  sendAvatarRequest(roomId:string, desiredAvatar:string, isOrganizer:boolean){
    const serverAvatarName=this.convertAvatarPathToIndex(desiredAvatar)
    this.socketService.emit(Gateway.ROOM, RoomEvents.DesiredAvatar, {roomId:roomId, desiredAvatar:serverAvatarName, isOrganizer:isOrganizer});
  }

  sendPlayerCreationFormOpened(roomId:string, isOrganizer:boolean){
    this.socketService.emit(Gateway.ROOM, RoomEvents.PlayerCreationOpened, {roomId:roomId, isOrganizer:isOrganizer});
  }

  sendPlayerCreationClosed(roomId:string, isOrganizer:boolean){
    this.socketService.emit(Gateway.ROOM, RoomEvents.PlayerCreationClosed, {roomId:roomId, isOrganizer:isOrganizer});
  }

  convertAvatarIndexToPath(avatarIndex: string): string | undefined {
    const index = parseInt(avatarIndex.replace('Avatar', ''));
    if (isNaN(index) || index < 0 || index >= AVATARS.length) {
      return undefined;
    }
    return AVATARS[index];
  }

  convertAvatarPathToIndex(avatarPath: string): string | undefined {
    const index = AVATARS.findIndex(path => path === avatarPath);
    if (index === -1) {
      return undefined;
    }
    return `Avatar${index}`;
  }

  selectAvatar(previousIndex: number, newIndex: number): void {
    this.avatarList.set(AVATARS[previousIndex], false);
    this.avatarList.set(AVATARS[newIndex], true);
  }
}
