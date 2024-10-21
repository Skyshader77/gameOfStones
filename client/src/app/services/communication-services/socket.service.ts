import { Injectable } from '@angular/core';
import { RoomEvents, SocketRole } from '@app/constants/socket.constants';
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

    joinRoom(roomId: string): void {
        if (!roomId) return;
        const socketIds = Array.from(this.sockets.values()).map((socket) => socket.id);
        this.sockets.get(SocketRole.ROOM)?.emit(RoomEvents.JOIN, { roomId, socketIds }); // TODO a redefinir quelque part
    }

    leaveRoom(roomId: string): void {
        const socketIds = Array.from(this.sockets.values()).map((socket) => socket.id);
        this.sockets.get(SocketRole.ROOM)?.emit(RoomEvents.LEAVE, { roomId, socketIds });
    }

    private connectSockets() {
        for (const role of Object.values(SocketRole)) {
            this.sockets.set(role, io(`${environment.serverUrl + role}`, { transports: ['websocket'], upgrade: false }));
        }
    }
}
