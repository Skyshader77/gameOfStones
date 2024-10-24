import { Gateway } from '@app/constants/gateways.constants';
import { Player } from '@app/interfaces/player';
import { Map } from '@app/model/database/map';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { PlayerRole } from '@common/interfaces/player.constants';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomEvents } from './room.gateway.events';

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
    handleCreateRoom(socket: Socket, data: { roomId: string; map: Map }) {
        this.logger.log(`Received CREATE event for roomId: ${data.roomId} from socket: ${socket.id}`);
        this.socketManagerService.assignNewRoom(data.roomId);
        this.roomManagerService.assignMapToRoom(data.roomId, data.map);
    }

    @SubscribeMessage(RoomEvents.JOIN)
    handleJoinRoom(socket: Socket, data: { roomId: string; playerSocketIndices: PlayerSocketIndices; player: Player }) {
        this.logger.log(`Received JOIN event for roomId: ${data.roomId} from socket: ${socket.id}`);
        const { roomId, playerSocketIndices, player } = data;

        let playerName = player.playerInfo.userName;
        const room = this.roomManagerService.getRoom(roomId);

        if (room.isLocked) {
            this.server.to(socket.id).emit(RoomEvents.ROOM_LOCKED, true);
            return;
        }

        // TODO check for isLocked
        if (room) {
            let count = 1;
            while (room?.players.some((existingPlayer) => existingPlayer.playerInfo.userName === playerName)) {
                playerName = `${player.playerInfo.userName}${count}`;
                count++;
            }

            player.playerInfo.userName = playerName;
            socket.data.roomCode = roomId;

            this.socketManagerService.assignSocketsToPlayer(roomId, player.playerInfo.userName, playerSocketIndices);
            this.roomManagerService.addPlayerToRoom(roomId, player);

            this.server.to(roomId).emit(RoomEvents.PLAYER_LIST, room.players);
            this.server.to(socket.id).emit(RoomEvents.ROOM_LOCKED, false);

            for (const key of Object.values(Gateway)) {
                const playerSocket = this.socketManagerService.getPlayerSocket(roomId, player.playerInfo.userName, key);
                if (playerSocket) {
                    this.logger.log(key);
                    this.logger.log(`${playerSocket.id} joined`);
                    playerSocket.join(roomId);
                    const name = this.socketManagerService.getSocketPlayerName(socket);
                    this.logger.log('user: ' + name);
                }
            }
        }
    }

    @SubscribeMessage(RoomEvents.FETCH_PLAYERS)
    handleFetchPlayers(socket: Socket, data: { roomId: string }) {
        const playerList = this.roomManagerService.getRoom(data.roomId)?.players || [];
        socket.emit(RoomEvents.PLAYER_LIST, playerList);
    }

    @SubscribeMessage(RoomEvents.DESIRE_TOGGLE_LOCK)
    handleToggleRoomLock(socket: Socket, data: { roomId: string }) {
        const room = this.roomManagerService.getRoom(data.roomId);

        if (room) {
            const playerName = this.socketManagerService.getSocketPlayerName(socket);

            const player = room.players.find((roomPlayer) => {
                return roomPlayer.playerInfo.userName === playerName;
            });

            if (player && player.playerInfo.role === PlayerRole.ORGANIZER) {
                room.isLocked = !room.isLocked;
            }
            this.logger.log('room locked: ' + room.isLocked);
            this.server.to(data.roomId).emit(RoomEvents.TOGGLE_LOCK, room.isLocked);
        }
    }

    @SubscribeMessage(RoomEvents.LEAVE)
    handleLeaveRoom(socket: Socket) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);

        if (roomCode && playerName) {
            this.disconnectPlayer(roomCode, playerName);
        }
    }

    @SubscribeMessage(RoomEvents.DESIRE_KICK_PLAYER)
    desireKickPlayer(socket: Socket, userName: string) {
        const room = this.socketManagerService.getSocketRoom(socket);

        if (room) {
            const kickerName = this.socketManagerService.getSocketPlayerName(socket);

            if (
                kickerName &&
                room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === kickerName).playerInfo.role === PlayerRole.ORGANIZER
            ) {
                this.disconnectPlayer(room.room.roomCode, userName);
            }
        }
    }

    afterInit() {
        this.logger.log('room gateway initialized');
    }

    // TODO very the order of operations.
    disconnectPlayer(roomCode: string, playerName: string) {
        if (!this.roomManagerService.getRoom(roomCode)) {
            return;
        }
        const player = this.roomManagerService.getRoom(roomCode).players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);
        this.roomManagerService.removePlayerFromRoom(roomCode, playerName);

        if (player.playerInfo.role === PlayerRole.ORGANIZER) {
            // TODO very hacky way to send that the room is deleted.
            this.server.to(roomCode).emit(RoomEvents.PLAYER_LIST, []);
            this.roomManagerService.deleteRoom(roomCode);
            this.logger.log('deleted room: ' + roomCode);
        } else {
            this.server.to(roomCode).emit(RoomEvents.PLAYER_LIST, this.roomManagerService.getRoom(roomCode).players);
        }

        for (const key of Object.values(Gateway)) {
            const playerSocket = this.socketManagerService.getPlayerSocket(roomCode, playerName, key);
            if (playerSocket) {
                this.logger.log(playerSocket.id + ' left the room');
                playerSocket.leave(roomCode);
            }
        }
        this.socketManagerService.unassignPlayerSockets(roomCode, playerName);
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
    }

    handleDisconnect(socket: Socket) {
        const roomCode = socket.data.roomCode;
        const playerName = this.socketManagerService.getDisconnectedPlayerName(roomCode, socket);

        if (roomCode && playerName) {
            this.disconnectPlayer(roomCode, playerName);
        }
    }
}
