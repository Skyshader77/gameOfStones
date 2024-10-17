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
    handleJoinRoom(socket: Socket, data: { roomId: string; socketIds: string[] }) {
        const { roomId, socketIds } = data;

        for (const socketId of socketIds) {
            const targetSocket = this.server.sockets.sockets.get(socketId);

            if (targetSocket) {
                targetSocket.join(roomId);
                targetSocket.emit(RoomEvents.JOIN, roomId);
                this.logger.log(`Socket ${socketId} joined room: ${roomId}`);
            } else {
                this.logger.warn(`Socket with ID ${socketId} not found.`);
            }
        }
    }

    @SubscribeMessage(RoomEvents.LEAVE)
    handleLeaveRoom(socket: Socket, data: { roomId: string; socketIds: string[] }) {
        const { roomId, socketIds } = data;

        for (const socketId of socketIds) {
            const targetSocket = this.server.sockets.sockets.get(socketId);

            if (targetSocket) {
                targetSocket.leave(roomId);
                targetSocket.emit(RoomEvents.LEAVE, roomId);
                this.logger.log(`Socket ${socketId} left room: ${roomId}`);
            } else {
                this.logger.warn(`Socket with ID ${socketId} not found.`);
            }
        }
    }

    afterInit() {
        this.logger.log('room gateway initialized');
    }

    handleConnection() {
        this.logger.log('connected!');
    }

    handleDisconnect() {
        this.logger.log('disconnected!');
    }
}
