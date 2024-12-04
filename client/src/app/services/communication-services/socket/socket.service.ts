import { Injectable } from '@angular/core';
import { UNKNOWN_SOCKET } from '@app/constants/api-errors.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { Observable, throwError } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private sockets: Map<Gateway, Socket>;

    constructor() {
        this.sockets = new Map<Gateway, Socket>();
        this.connectSockets();
    }

    get getSockets() {
        return this.sockets;
    }

    disconnect(socketGateway: Gateway) {
        this.sockets.get(socketGateway)?.disconnect();
    }

    disconnectAll() {
        this.sockets.forEach((socket: Socket) => {
            socket.disconnect();
        });
    }

    on<T>(socketGateway: Gateway, event: string): Observable<T> {
        const socket = this.sockets.get(socketGateway);
        if (!socket) {
            return throwError(() => new Error(UNKNOWN_SOCKET));
        }
        return new Observable<T>((subscriber) => {
            socket.on(event, (data: T) => {
                subscriber.next(data);
            });
        });
    }

    emit<T>(socketGateway: Gateway, event: string, data?: T): void {
        const socket = this.sockets.get(socketGateway);
        if (!socket) {
            throw new Error(UNKNOWN_SOCKET);
        } else {
            socket.emit(event, data);
        }
    }

    private connectSockets() {
        for (const role of Object.values(Gateway)) {
            this.sockets.set(role, io(`${environment.serverUrl + role}`, { transports: ['websocket'], upgrade: false }));
        }
    }
}
