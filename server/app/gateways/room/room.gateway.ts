import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomEvents } from './room.gateway.events';

@WebSocketGateway({ namespace: '/room', cors: true })
@Injectable()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(RoomEvents.JOIN)
    handleJoinRoom(socket: Socket, room: string) {
        socket.join(room);
        socket.emit(RoomEvents.JOIN, room);
        this.logger.log(`Socket ${socket.id} joined room: ${room}`);
    }

    handleLeaveRoom(socket: Socket, room: string) {
        socket.leave(room);
        socket.emit(RoomEvents.LEAVE, room);
        this.logger.log(`Socket ${socket.id} left room: ${room}`);
    }

    afterInit() {
        this.logger.log('socket created');
    }

    handleConnection() {
        this.logger.log('connected!');
    }

    handleDisconnect() {
        this.logger.log('disconnected!');
    }
}
