import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Gateway } from '@common/interfaces/gateway.constants';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
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
            room: this.socketService.getSockets.get(Gateway.ROOM)?.id || '',
            game: this.socketService.getSockets.get(Gateway.GAME)?.id || '',
            chat: this.socketService.getSockets.get(Gateway.CHAT)?.id || '',
        };

        this.socketService.getSockets.get(Gateway.ROOM)?.emit(RoomEvents.JOIN, { roomId, playerSocketIndices, player });
    }

    createRoom(roomId: string): void {
        if (!roomId) return;
        this.socketService.getSockets.get(Gateway.ROOM)?.emit(RoomEvents.CREATE, { roomId });
    }

    leaveRoom(roomId: string, player: Player): void {
        this.socketService.getSockets.get(Gateway.ROOM)?.emit(RoomEvents.LEAVE, { roomId, player });
    }
}
