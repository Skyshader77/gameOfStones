import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { RoomEvents, SocketRole } from '@app/constants/socket.constants';
import { Player } from '@app/interfaces/player';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Socket } from 'socket.io-client';
import { Map } from '@app/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class RoomSocketService {
    constructor(private socketService: SocketService) {}

    joinRoom(roomId: string, player: Player): void {
        if (!roomId) return;

        const playerSocketIndices: PlayerSocketIndices = {
            room: this.socketService.getSockets.get(SocketRole.ROOM)?.id || '',
            game: this.socketService.getSockets.get(SocketRole.GAME)?.id || '',
            chat: this.socketService.getSockets.get(SocketRole.CHAT)?.id || '',
        };

        this.getRoomSocket()?.emit(RoomEvents.JOIN, { roomId, playerSocketIndices, player });
    }

    createRoom(roomId: string, map: Map): void {
        if (!roomId) return;
        this.getRoomSocket()?.emit(RoomEvents.CREATE, { roomId, map });
    }

    leaveRoom(roomId: string, player: Player): void {
        this.getRoomSocket()?.emit(RoomEvents.LEAVE, { roomId, player });
    }

    toggleRoomLock(roomId: string): void {
        this.getRoomSocket()?.emit(RoomEvents.TOGGLE_LOCK, { roomId });
    }

    private getRoomSocket(): Socket | undefined {
        return this.socketService.getSockets.get(SocketRole.ROOM);
    }
}
