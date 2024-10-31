import { INITIAL_AVATAR_SELECTION } from '@common/constants/avatar-selection.constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AvatarManagerService {
  private avatarsByRoom: Map<string, Map<string, boolean>>;
  private avatarsBySocket: Map<string, Map<string, string>>;

  constructor() {
    this.avatarsByRoom = new Map();
    this.avatarsBySocket = new Map();
  }


  initializeAvatarList(roomCode: string): void {
    this.avatarsByRoom.set(roomCode, new Map(INITIAL_AVATAR_SELECTION));
    this.avatarsBySocket.set(roomCode, new Map());
  }


  getAvatarsByRoomCode(roomCode: string): Map<string, boolean> | undefined {
    return this.avatarsByRoom.get(roomCode);
  }


  isAvatarTaken(roomCode: string, avatar: string): boolean {
    return this.avatarsByRoom.get(roomCode).get(avatar);
  }

  toggleAvatarTaken(roomCode: string, avatar: string, socketId: string): boolean {
    const roomAvatars = this.avatarsByRoom.get(roomCode);
    const socketAvatars = this.avatarsBySocket.get(roomCode);

    if (!roomAvatars || !socketAvatars || this.isAvatarTaken(roomCode, avatar)) {
      return false;
    }

    const oldAvatar = socketAvatars.get(socketId);
    if (oldAvatar) {
      roomAvatars.set(oldAvatar, false);
    }
    roomAvatars.set(avatar, true);
    socketAvatars.set(socketId, avatar);

    return true;
  }

  setStartingAvatar(roomCode: string, socketId: string) {
    const roomAvatars = this.avatarsByRoom.get(roomCode);
    const socketAvatars = this.avatarsBySocket.get(roomCode);

    if (!roomAvatars || !socketAvatars) {
      return undefined;
    }

    for (const [avatar, isTaken] of roomAvatars.entries()) {
      if (!isTaken) {
        roomAvatars.set(avatar, true);
        socketAvatars.set(socketId, avatar);
      }
    }
  }

  removeSocket(roomCode: string, socketId: string): void {
    const roomAvatars = this.avatarsByRoom.get(roomCode);
    const socketAvatars = this.avatarsBySocket.get(roomCode);

    if (!roomAvatars || !socketAvatars) {
      return;
    }

    const avatar = socketAvatars.get(socketId);
    if (avatar) {
      roomAvatars.set(avatar, false);
      socketAvatars.delete(socketId);
    }
  }
}
