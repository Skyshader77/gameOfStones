import { AVATAR_LIST_LENGTH } from '@app/constants/player-creation.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { Injectable } from '@nestjs/common';
@Injectable()
export class AvatarManagerService {
    private avatarsTakenByRoom: Map<string, boolean[]>;
    private avatarsBySocket: Map<string, Map<string, Avatar>>;

    constructor() {
        this.avatarsTakenByRoom = new Map();
        this.avatarsBySocket = new Map();
    }

    initializeAvatarList(roomCode: string, organizerAvatar: Avatar, socketId: string): void {
        this.avatarsTakenByRoom.set(roomCode, Array(AVATAR_LIST_LENGTH).fill(false));
        this.avatarsBySocket.set(roomCode, new Map());
        this.avatarsBySocket.get(roomCode).set(socketId, organizerAvatar);
        this.avatarsTakenByRoom.get(roomCode)[organizerAvatar] = true;
    }

    getTakenAvatarsByRoomCode(roomCode: string): boolean[] {
        return this.avatarsTakenByRoom.get(roomCode);
    }

    getAvatarBySocketId(roomCode: string, socketId: string): Avatar {
        return this.avatarsBySocket?.get(roomCode)?.get(socketId);
    }

    isAvatarTaken(roomCode: string, avatar: Avatar): boolean {
        return this.avatarsTakenByRoom.get(roomCode)[avatar];
    }

    toggleAvatarTaken(roomCode: string, avatar: Avatar, socketId: string): boolean {
        const roomAvatars = this.avatarsTakenByRoom.get(roomCode);
        const socketAvatars = this.avatarsBySocket.get(roomCode);

        if (!roomAvatars || !socketAvatars || this.isAvatarTaken(roomCode, avatar)) {
            return false;
        }

        const oldAvatar = socketAvatars.get(socketId);
        roomAvatars[oldAvatar] = false;

        roomAvatars[avatar] = true;
        socketAvatars.set(socketId, avatar);

        return true;
    }

    setStartingAvatar(roomCode: string, socketId: string) {
        const roomAvatars = this.avatarsTakenByRoom.get(roomCode);
        const socketAvatars = this.avatarsBySocket.get(roomCode);

        if (!roomAvatars || !socketAvatars) {
            return;
        }

        for (const [avatar, isTaken] of roomAvatars.entries()) {
            if (!isTaken) {
                roomAvatars[avatar] = true;
                socketAvatars.set(socketId, avatar);
                break;
            }
        }
    }

    getVirtualPlayerStartingAvatar(roomCode: string): Avatar {
        const roomAvatars = this.avatarsTakenByRoom.get(roomCode);
        if (!roomAvatars) return;

        let randomAvatarIndex = Math.floor(Math.random() * roomAvatars.length);

        while (roomAvatars[randomAvatarIndex]) {
            randomAvatarIndex = Math.floor(Math.random() * roomAvatars.length);
        }

        roomAvatars[randomAvatarIndex] = true;

        return randomAvatarIndex;
    }

    removeSocket(roomCode: string, socketId: string): void {
        const roomAvatars = this.avatarsTakenByRoom.get(roomCode);
        const socketAvatars = this.avatarsBySocket.get(roomCode);

        if (!roomAvatars || !socketAvatars) {
            return;
        }

        const avatar = socketAvatars.get(socketId);
        roomAvatars[avatar] = false;
        socketAvatars.delete(socketId);
    }

    freeVirtualPlayerAvatar(roomCode: string, avatar: Avatar) {
        const roomAvatars = this.avatarsTakenByRoom.get(roomCode);
        roomAvatars[avatar] = false;
    }

    removeRoom(roomCode: string): void {
        this.avatarsTakenByRoom.delete(roomCode);
        this.avatarsBySocket.delete(roomCode);
    }
}
