import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: Socket;

    constructor() {
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    on<T>(event: string): Observable<T> {
        return new Observable<T>((subscriber) => {
            this.socket.on(event, (data: T) => {
                subscriber.next(data);
            });
        });
    }

    send<T>(event: string, data?: T): void {
        this.socket.emit(event, data);
    }
}
