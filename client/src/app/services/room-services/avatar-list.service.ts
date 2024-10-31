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
  avatarList:Map<string, boolean>;
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
}

// @SubscribeMessage(RoomEvents.PlayerCreationOpened)
// handlePlayerCreationOpened(socket: Socket, data:{ roomId: string; isOrganizer:boolean}){
//     const { roomId,  isOrganizer } = data;
//     if (!isOrganizer){
//         this.avatarManagerService.setStartingAvatar(roomId,socket.id);
//         socket.emit(RoomEvents.AvailableAvatars, this.avatarManagerService.getAvatarsByRoomCode(roomId));
//     } 
// }

// @SubscribeMessage(RoomEvents.DesiredAvatar)
// handleDesiredAvatar(socket: Socket, data:{ roomId: string; desiredAvatar:string; isOrganizer:boolean}){
//     const { roomId,desiredAvatar,  isOrganizer } = data;
//     if (!isOrganizer){
//         this.avatarManagerService.toggleAvatarTaken(roomId,desiredAvatar,socket.id);
//         socket.emit(RoomEvents.AvailableAvatars, this.avatarManagerService.getAvatarsByRoomCode(roomId));
//     } 
// }

// @SubscribeMessage(RoomEvents.PlayerCreationClosed)
// handlePlayerCreationClosed(socket: Socket, data: { roomId: string; isOrganizer:boolean }){
//     const { roomId, isOrganizer } = data;
//     if (isOrganizer){
//         this.avatarManagerService.removeRoom(roomId);
//     } else{
//         this.avatarManagerService.removeSocket(roomId,socket.id);
//         socket.emit(RoomEvents.AvailableAvatars, this.avatarManagerService.getAvatarsByRoomCode(roomId))    
//     }
// }