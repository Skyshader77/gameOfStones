import { Injectable } from '@angular/core';
import { RoomEvents, SocketRole } from '@app/constants/socket.constants';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Player } from '@app/interfaces/player';
import { Observable, throwError } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private sockets: Map<SocketRole, Socket>;

    constructor() {
        this.sockets = new Map<SocketRole, Socket>();
        this.connectSockets();
    }

    disconnect(socketRole: SocketRole) {
        this.sockets.get(socketRole)?.disconnect();
    }

    on<T>(socketRole: SocketRole, event: string): Observable<T> {
        const socket = this.sockets.get(socketRole);
        if (!socket) {
            return throwError(() => new Error("Le socket demandé n'existe pas!"));
        }
        return new Observable<T>((subscriber) => {
            socket.on(event, (data: T) => {
                subscriber.next(data);
            });
        });
    }

    emit<T>(socketRole: SocketRole, event: string, data?: T): void {
        const socket = this.sockets.get(socketRole);
        if (!socket) {
            throw new Error("Le socket demandé n'existe pas!");
        } else {
            socket.emit(event, data);
        }
    }

    joinRoom(roomId: string, player: Player): void {
        if (!roomId) return;

        const playerSocketIndices: PlayerSocketIndices = {
            room: this.sockets.get(SocketRole.ROOM)?.id || '',
            game: this.sockets.get(SocketRole.GAME)?.id || '',
            chat: this.sockets.get(SocketRole.CHAT)?.id || '',
        };

        this.sockets.get(SocketRole.ROOM)?.emit(RoomEvents.JOIN, { roomId, playerSocketIndices, player });
    }

    createRoom(roomId: string): void {
        if (!roomId) return;
        this.sockets.get(SocketRole.ROOM)?.emit(RoomEvents.CREATE, { roomId });
    }

    leaveRoom(roomId: string, player: Player): void {
        this.sockets.get(SocketRole.ROOM)?.emit(RoomEvents.LEAVE, { roomId, player });
    }

    private connectSockets() {
        for (const role of Object.values(SocketRole)) {
            this.sockets.set(role, io(environment.serverUrl + role, { transports: ['websocket'], upgrade: false }));
        }
    }
}
