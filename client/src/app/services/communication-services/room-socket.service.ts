import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { RoomEvents, SocketRole } from '@app/constants/socket.constants';
import { Player } from '@app/interfaces/player';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
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

        if (playerSocketIndices.room) {
            this.socketService.emit(SocketRole.ROOM, RoomEvents.JOIN, { roomId, playerSocketIndices, player });
        }
    }

    createRoom(roomId: string, map: Map): void {
        if (!roomId) return;
        this.socketService.emit(SocketRole.ROOM, RoomEvents.CREATE, { roomId, map });
    }

    leaveRoom(): void {
        this.socketService.emit(SocketRole.ROOM, RoomEvents.LEAVE);
    }

    toggleRoomLock(roomId: string): void {
        this.socketService.emit(SocketRole.ROOM, RoomEvents.TOGGLE_LOCK, { roomId });
    }
}
