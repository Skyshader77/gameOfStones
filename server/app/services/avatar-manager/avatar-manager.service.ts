import { AVATAR_LIST_LENGTH } from '@app/constants/player-creation.constants';
import { AvatarChoice } from '@common/constants/player.constants';
import { Injectable } from '@nestjs/common';
@Injectable()
export class AvatarManagerService {
    private avatarsTakenByRoom: Map<string, boolean[]>; // Room -> True/false[]
    private avatarsBySocket: Map<string, Map<string, AvatarChoice>>; // Room -> (socketID -> Avatar)

    constructor() {
        this.avatarsTakenByRoom = new Map();
        this.avatarsBySocket = new Map();
    }

    initializeAvatarList(roomCode: string, organizerAvatar: AvatarChoice, socketId: string): void {
        this.avatarsTakenByRoom.set(roomCode, Array(AVATAR_LIST_LENGTH).fill(false));
        this.avatarsBySocket.set(roomCode, new Map());
        this.avatarsBySocket.get(roomCode).set(socketId, organizerAvatar);
        this.avatarsTakenByRoom.get(roomCode)[organizerAvatar] = true;
    }

    getTakenAvatarsByRoomCode(roomCode: string): boolean[] {
        return this.avatarsTakenByRoom.get(roomCode);
    }

    getAvatarBySocketId(roomCode: string, socketId: string): AvatarChoice {
        return this.avatarsBySocket?.get(roomCode)?.get(socketId);
    }

    isAvatarTaken(roomCode: string, avatar: AvatarChoice): boolean {
        return this.avatarsTakenByRoom.get(roomCode)[avatar];
    }

    toggleAvatarTaken(roomCode: string, avatar: AvatarChoice, socketId: string): boolean {
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

    removeRoom(roomCode: string): void {
        this.avatarsTakenByRoom.delete(roomCode);
        this.avatarsBySocket.delete(roomCode);
    }
}
