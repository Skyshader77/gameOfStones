import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomEvents } from './room.gateway.events';
import { Player } from '@app/interfaces/player';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';

@WebSocketGateway({ namespace: '/room', cors: true })
@Injectable()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private roomManagerService: RoomManagerService,
        private socketManagerService: SocketManagerService,
    ) {}

    @SubscribeMessage(RoomEvents.CREATE)
    handleCreateRoom(socket: Socket, data: { roomId: string }) {
        this.socketManagerService.assignNewRoom(data.roomId);
    }

    @SubscribeMessage(RoomEvents.JOIN)
    handleJoinRoom(socket: Socket, data: { roomId: string; playerSocketIndices: PlayerSocketIndices; player: Player }) {
        const { roomId, playerSocketIndices, player } = data;

        this.socketManagerService.assignSocketsToPlayer(roomId, player.playerInfo.userName, playerSocketIndices);

        Object.values(playerSocketIndices).forEach((socketId) => {
            const targetSocket = this.server.sockets.sockets.get(socketId);
            if (targetSocket) {
                targetSocket.join(roomId);
                targetSocket.emit(RoomEvents.JOIN, roomId);
                this.logger.log(`Socket ${socketId} joined room: ${roomId}`);
            } else {
                this.logger.warn(`Socket with ID ${socketId} not found.`);
            }
        });
    }

    @SubscribeMessage(RoomEvents.FETCH_PLAYERS)
    handleFetchPlayers(socket: Socket, data: { roomId: string }) {
        const playerList = this.roomManagerService.getRoom(data.roomId).players;
        socket.emit(RoomEvents.PLAYER_LIST, playerList);
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
