import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { RoomEvents, SocketRole } from '@app/constants/socket.constants';
import { Player } from '@app/interfaces/player';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';

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

        this.socketService.getSockets.get(SocketRole.ROOM)?.emit(RoomEvents.JOIN, { roomId, playerSocketIndices, player });
    }

    createRoom(roomId: string): void {
        if (!roomId) return;
        this.socketService.getSockets.get(SocketRole.ROOM)?.emit(RoomEvents.CREATE, { roomId });
    }

    leaveRoom(roomId: string, player: Player): void {
        this.socketService.getSockets.get(SocketRole.ROOM)?.emit(RoomEvents.LEAVE, { roomId, player });
    }
}
