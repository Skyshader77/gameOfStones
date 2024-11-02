import { AVATAR_LIST_LENGTH } from '@app/constants/player-creation.constants';
import { AvatarChoice } from '@common/constants/player.constants';
import { Injectable } from '@nestjs/common';
@Injectable()
export class AvatarManagerService {
    private avatarsByRoom: Map<string, boolean[]>; // Room -> True/false[]
    private avatarsBySocket: Map<string, Map<string, AvatarChoice>>; // Room -> (socketID -> Avatar)

    constructor() {
        this.avatarsByRoom = new Map();
        this.avatarsBySocket = new Map();
    }

    initializeAvatarList(roomCode: string, organizerAvatar: AvatarChoice, socketId: string): void {
        this.avatarsByRoom.set(roomCode, Array(AVATAR_LIST_LENGTH).fill(false));
        this.avatarsBySocket.set(roomCode, new Map());
        this.avatarsBySocket.get(roomCode).set(socketId, organizerAvatar);
        this.avatarsByRoom.get(roomCode)[organizerAvatar] = true;
    }

    getAvatarsByRoomCode(roomCode: string): boolean[] {
        return this.avatarsByRoom.get(roomCode);
    }

    getAvatarBySocketId(roomCode: string, socketId: string): AvatarChoice {
        return this.avatarsBySocket?.get(roomCode)?.get(socketId);
    }

    isAvatarTaken(roomCode: string, avatar: AvatarChoice): boolean {
        return this.avatarsByRoom.get(roomCode)[avatar];
    }

    toggleAvatarTaken(roomCode: string, avatar: AvatarChoice, socketId: string): boolean {
        const roomAvatars = this.avatarsByRoom.get(roomCode);
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
        const roomAvatars = this.avatarsByRoom.get(roomCode);
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
        const roomAvatars = this.avatarsByRoom.get(roomCode);
        const socketAvatars = this.avatarsBySocket.get(roomCode);

        if (!roomAvatars || !socketAvatars) {
            return;
        }

        const avatar = socketAvatars.get(socketId);
        roomAvatars[avatar] = false;
        socketAvatars.delete(socketId);
    }

    removeRoom(roomCode: string): void {
        this.avatarsByRoom.delete(roomCode);
        this.avatarsBySocket.delete(roomCode);
    }
}
