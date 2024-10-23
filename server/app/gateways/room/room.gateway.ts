import { Gateway } from '@common/interfaces/socket.constants';
import { Player } from '@app/interfaces/player';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomEvents } from './room.gateway.events';
import { PlayerRole } from '@common/interfaces/player.constants';

@WebSocketGateway({ namespace: `/${Gateway.ROOM}`, cors: true })
@Injectable()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private roomManagerService: RoomManagerService,
        private socketManagerService: SocketManagerService,
    ) {
        this.socketManagerService.setGatewayServer(Gateway.ROOM, this.server);
    }

    @SubscribeMessage(RoomEvents.CREATE)
    handleCreateRoom(socket: Socket, data: { roomId: string }) {
        this.logger.log(`Received CREATE event for roomId: ${data.roomId} from socket: ${socket.id}`);
        this.socketManagerService.assignNewRoom(data.roomId);
    }

    @SubscribeMessage(RoomEvents.JOIN)
    handleJoinRoom(socket: Socket, data: { roomId: string; playerSocketIndices: PlayerSocketIndices; player: Player }) {
        this.logger.log(`Received JOIN event for roomId: ${data.roomId} from socket: ${socket.id}`);
        const { roomId, playerSocketIndices, player } = data;

        let playerName = player.playerInfo.userName;
        const room = this.roomManagerService.getRoom(roomId);

        let count = 1;
        while (room?.players.some((existingPlayer) => existingPlayer.playerInfo.userName === playerName)) {
            playerName = `${player.playerInfo.userName}${count}`;
            count++;
        }

        player.playerInfo.userName = playerName;

        socket.data.roomCode = roomId;

        this.socketManagerService.assignSocketsToPlayer(roomId, player.playerInfo.userName, playerSocketIndices);
        this.roomManagerService.addPlayerToRoom(roomId, player);

        this.server.to(roomId).emit(RoomEvents.PLAYER_LIST, this.roomManagerService.getRoom(roomId)?.players || []);

        for (const key of Object.values(Gateway)) {
            const playerSocket = this.socketManagerService.getPlayerSocket(roomId, player.playerInfo.userName, key);
            if (playerSocket) {
                this.logger.log(`${playerSocket.id} joined`);
                playerSocket.join(roomId);
                const name = this.socketManagerService.getSocketPlayerName(socket);
                this.logger.log('user: ' + name);
            }
        }
    }

    @SubscribeMessage(RoomEvents.FETCH_PLAYERS)
    handleFetchPlayers(socket: Socket, data: { roomId: string }) {
        const playerList = this.roomManagerService.getRoom(data.roomId)?.players || [];
        socket.emit(RoomEvents.PLAYER_LIST, playerList);
    }

    @SubscribeMessage(RoomEvents.LEAVE)
    handleLeaveRoom(socket: Socket, data: { roomId: string; player: Player }) {
        const { roomId, player } = data;

        this.roomManagerService.removePlayerFromRoom(roomId, player);
        this.socketManagerService.unassignPlayerSockets(roomId, player.playerInfo.userName);

        for (const key of Object.values(Gateway)) {
            const playerSocket = this.socketManagerService.getPlayerSocket(roomId, player.playerInfo.userName, key);
            if (playerSocket) {
                this.logger.log(playerSocket.id + ' left the room');
                playerSocket.leave(roomId);
            }
        }
    }

    afterInit() {
        this.logger.log('room gateway initialized');
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
    }

    handleDisconnect(socket: Socket) {
        const roomCode = socket.data.roomCode;
        const playerName = this.socketManagerService.getDisconnectedPlayerName(roomCode, socket);

        if (roomCode && playerName) {
            const room = this.roomManagerService.getRoom(roomCode);
            const player = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);
            if (player.playerInfo.role === PlayerRole.ORGANIZER) {
                // TODO send to others that the room doesnt exist.
                this.roomManagerService.deleteRoom(roomCode);
                this.logger.log('deleted room: ' + roomCode);
            }
        }
    }
}
