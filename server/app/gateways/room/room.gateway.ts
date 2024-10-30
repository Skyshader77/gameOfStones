import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Map } from '@app/model/database/map';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/constants/gateway.constants';
import { PlayerRole } from '@common/constants/player.constants';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { JoinErrors } from '@common/interfaces/join-errors';
import { SocketData } from '@app/interfaces/socket-data';
import { INITIAL_NAME_EXTENSION } from '@app/constants/player-creation.constants';

@WebSocketGateway({ namespace: `/${Gateway.ROOM}`, cors: true })
@Injectable()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private roomManagerService: RoomManagerService,
        private socketManagerService: SocketManagerService,
        private chatManagerService: ChatManagerService,
        private chatGateway: ChatGateway,
    ) {
        this.socketManagerService.setGatewayServer(Gateway.ROOM, this.server);
    }

    @SubscribeMessage(RoomEvents.Create)
    handleCreateRoom(socket: Socket, data: { roomId: string; map: Map }) {
        this.socketManagerService.assignNewRoom(data.roomId);
        this.roomManagerService.assignMapToRoom(data.roomId, data.map);
    }

    @SubscribeMessage(RoomEvents.DesireJoinRoom)
    handleDesireJoinRoom(socket: Socket, data: { roomId: string; playerSocketIndices: PlayerSocketIndices; player: Player }) {
        const { roomId, playerSocketIndices, player } = data;
        const room = this.roomManagerService.getRoom(roomId);

<<<<<<< HEAD
        let count = 2;
        if (room) {
            while (room.players.some((existingPlayer) => existingPlayer.playerInfo.userName === playerName)) {
                playerName = `${player.playerInfo.userName}-${count}`;
                count++;
            }
=======
        if (!room) {
            socket.emit(RoomEvents.JoinError, JoinErrors.RoomDeleted);
            return;
        } else if (room.room.isLocked) {
            socket.emit(RoomEvents.JoinError, JoinErrors.RoomLocked);
            return;
>>>>>>> 08783f7de30e2dc78e9f51c78f569f77d9ba4274
        }

        if (room) {
            player.playerInfo.userName = this.generateUniquePlayerName(room, player.playerInfo.userName);
            socket.data.roomCode = roomId;

            this.socketManagerService.assignSocketsToPlayer(roomId, player.playerInfo.userName, playerSocketIndices);
            this.roomManagerService.addPlayerToRoom(roomId, player);
            this.socketManagerService.handleJoiningSockets(roomId, player.playerInfo.userName);

            const socketData: SocketData = { server: this.server, socket, player, roomId };
            this.roomManagerService.handleJoiningSocketEmissions(socketData);

            const olderMessages = this.chatManagerService.fetchOlderMessages(roomId);
            this.chatGateway.sendChatHistory(olderMessages, socket, roomId);
        }
    }

    @SubscribeMessage(RoomEvents.DesireToggleLock)
    handleToggleRoomLock(socket: Socket, data: { roomId: string }) {
        const room = this.roomManagerService.getRoom(data.roomId);

        if (room) {
            if (this.roomManagerService.isPlayerLimitReached(data.roomId)) return;
            const playerName = this.socketManagerService.getSocketPlayerName(socket);

            const player = room.players.find((roomPlayer) => {
                return roomPlayer.playerInfo.userName === playerName;
            });

            if (player && player.playerInfo.role === PlayerRole.ORGANIZER) {
                this.roomManagerService.toggleIsLocked(room.room);
                this.server.to(data.roomId).emit(RoomEvents.RoomLocked, room.room.isLocked);
            }
        }
    }

    @SubscribeMessage(RoomEvents.Leave)
    handleLeaveRoom(socket: Socket) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);

        if (roomCode && playerName) {
            this.disconnectPlayer(roomCode, playerName);
        }
    }

    @SubscribeMessage(RoomEvents.DesireKickPlayer)
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
        let wasLimitReached = false;
        if (this.roomManagerService.isPlayerLimitReached(roomCode)) wasLimitReached = true;

        const player = this.roomManagerService.getRoom(roomCode).players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);
        this.roomManagerService.removePlayerFromRoom(roomCode, playerName);

        if (player.playerInfo.role === PlayerRole.ORGANIZER) {
            this.server.to(roomCode).emit(RoomEvents.RoomClosed);
            this.roomManagerService.deleteRoom(roomCode);
        } else {
            this.server.to(roomCode).emit(RoomEvents.RemovePlayer, playerName);
        }
        if (wasLimitReached) this.server.to(roomCode).emit(RoomEvents.PlayerLimitReached, false);

        this.socketManagerService.handleLeavingSockets(roomCode, playerName);
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

    private generateUniquePlayerName(room: RoomGame, baseName: string): string {
        let playerName = baseName;
        let count = INITIAL_NAME_EXTENSION;

        while (room.players.some((player) => player.playerInfo.userName === playerName)) {
            playerName = `${baseName}-${count}`;
            count++;
        }

        return playerName;
    }
}
