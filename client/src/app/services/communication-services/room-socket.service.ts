import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Gateway } from '@common/constants/gateway.constants';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { Player } from '@app/interfaces/player';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Map } from '@app/interfaces/map-mouse-event';
import { Observable } from 'rxjs';

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

        if (playerSocketIndices.room) {
            this.socketService.emit(Gateway.ROOM, RoomEvents.JOIN, { roomId, playerSocketIndices, player });
        }
    }

    createRoom(roomId: string, map: Map): void {
        if (!roomId) return;
        this.socketService.emit(Gateway.ROOM, RoomEvents.CREATE, { roomId, map });
    }

    leaveRoom(): void {
        this.socketService.emit(Gateway.ROOM, RoomEvents.LEAVE);
    }

    toggleRoomLock(roomId: string): void {
        this.socketService.emit(Gateway.ROOM, RoomEvents.DESIRE_TOGGLE_LOCK, { roomId });
    }

    listenForToggleLock(): Observable<boolean> {
        return this.socketService.on<boolean>(Gateway.ROOM, RoomEvents.TOGGLE_LOCK);
    }

    listenForRoomLocked(): Observable<boolean> {
        return this.socketService.on<boolean>(Gateway.ROOM, RoomEvents.ROOM_LOCKED);
    }
}
