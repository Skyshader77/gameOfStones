import { INITIAL_NAME_EXTENSION } from '@app/constants/player-creation.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { SocketData } from '@app/interfaces/socket-data';
import { Map } from '@app/model/database/map';
import { AvatarManagerService } from '@app/services/avatar-manager/avatar-manager.service';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/constants/gateway.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { JoinErrors } from '@common/enums/join-errors.enum';
import { Player } from '@app/interfaces/player';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameStatus } from '@common/enums/game-status.enum';

@WebSocketGateway({ namespace: `/${Gateway.ROOM}`, cors: true })
@Injectable()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private roomManagerService: RoomManagerService,
        private socketManagerService: SocketManagerService,
        private chatManagerService: ChatManagerService,
        private avatarManagerService: AvatarManagerService,
    ) {
        this.socketManagerService.setGatewayServer(Gateway.ROOM, this.server);
    }

    @SubscribeMessage(RoomEvents.Create)
    handleCreateRoom(socket: Socket, data: { roomId: string; map: Map; avatar: Avatar }) {
        this.avatarManagerService.initializeAvatarList(data.roomId, data.avatar, socket.id);
        this.socketManagerService.assignNewRoom(data.roomId);
        this.roomManagerService.assignMapToRoom(data.roomId, data.map);
    }

    @SubscribeMessage(RoomEvents.PlayerCreationOpened)
    handlePlayerCreationOpened(socket: Socket, roomCode: string) {
        const room = this.roomManagerService.getRoom(roomCode);
        if (!this.checkIfRoomIsValid(socket, room)) return;

        socket.join(roomCode);
        socket.data.roomCode = roomCode;
        this.avatarManagerService.setStartingAvatar(roomCode, socket.id);
        this.sendAvatarData(socket, roomCode);
    }

    @SubscribeMessage(RoomEvents.DesiredAvatar)
    handleDesiredAvatar(socket: Socket, desiredAvatar: Avatar) {
        const roomCode = this.socketManagerService.getSocketRoom(socket)?.room.roomCode;
        this.avatarManagerService.toggleAvatarTaken(roomCode, desiredAvatar, socket.id);
        this.sendAvatarData(socket, roomCode);
    }

    @SubscribeMessage(RoomEvents.PlayerCreationClosed)
    handlePlayerCreationClosed(socket: Socket, roomId: string) {
        this.avatarManagerService.removeSocket(roomId, socket.id);
        socket.leave(roomId);
        this.server.to(roomId).emit(RoomEvents.AvailableAvatars, this.avatarManagerService.getTakenAvatarsByRoomCode(roomId));
    }

    @SubscribeMessage(RoomEvents.DesireJoinRoom)
    handleDesireJoinRoom(socket: Socket, data: { roomId: string; playerSocketIndices: PlayerSocketIndices; player: Player }) {
        const { roomId, playerSocketIndices, player } = data;
        const room = this.roomManagerService.getRoom(roomId);
        if (!this.checkIfRoomIsValid(socket, room)) return;
        player.playerInfo.userName = this.generateUniquePlayerName(room, player.playerInfo.userName);
        socket.data.roomCode = roomId;
        this.roomManagerService.addPlayerToRoom(roomId, player);
        this.socketManagerService.handleJoiningSockets(roomId, player.playerInfo.userName, playerSocketIndices);
        const socketData: SocketData = { server: this.server, socket, player, roomId };
        this.roomManagerService.handleJoiningSocketEmissions(socketData);

        const chatSocket = this.socketManagerService.getPlayerSocket(roomId, player.playerInfo.userName, Gateway.MESSAGING);
        if (chatSocket) this.chatManagerService.sendChatHistory(chatSocket, roomId);
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

            if (player && player.playerInfo.role === PlayerRole.Organizer) {
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
            this.playerLeavingCleanUp(roomCode, playerName, socket);
        }
    }

    @SubscribeMessage(RoomEvents.DesireKickPlayer)
    desireKickPlayer(socket: Socket, playerName: string) {
        const room = this.socketManagerService.getSocketRoom(socket);

        if (room && playerName) {
            const kickerName = this.socketManagerService.getSocketPlayerName(socket);

            if (
                kickerName &&
                room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === kickerName).playerInfo.role === PlayerRole.Organizer
            ) {
                const roomCode = room.room.roomCode;
                this.playerLeavingCleanUp(roomCode, playerName, socket);
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
            this.playerLeavingCleanUp(roomCode, playerName, socket);
        }
    }

    private playerLeavingCleanUp(roomCode: string, playerName: string, socket: Socket) {
        const room = this.roomManagerService.getRoom(roomCode);
        if (room && room.game.status === GameStatus.Waiting) {
            this.disconnectPlayer(room.room.roomCode, playerName);
            this.avatarManagerService.removeSocket(roomCode, socket.id);
            this.server.to(roomCode).emit(RoomEvents.AvailableAvatars, this.avatarManagerService.getTakenAvatarsByRoomCode(roomCode));
        }
    }

    private disconnectPlayer(roomCode: string, playerName: string) {
        const player = this.roomManagerService.getPlayerInRoom(roomCode, playerName);
        if (!player) return;

        if (this.roomManagerService.isPlayerLimitReached(roomCode)) {
            this.server.to(roomCode).emit(RoomEvents.PlayerLimitReached, false);
        } // If player limit was reached before removal, we inform the clients that it is not anymore.

        if (player.playerInfo.role === PlayerRole.Organizer) {
            this.server.to(roomCode).emit(RoomEvents.RoomClosed);
            this.socketManagerService.deleteRoom(roomCode);
            this.roomManagerService.deleteRoom(roomCode);
            this.logger.log('[Room] Cleanup of the room');
        } else {
            this.roomManagerService.removePlayerFromRoom(roomCode, playerName);
            this.server.to(roomCode).emit(RoomEvents.RemovePlayer, playerName);
        }

        this.socketManagerService.handleLeavingSockets(roomCode, playerName);
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

    private checkIfRoomIsValid(socket: Socket, room: RoomGame): boolean {
        if (!room) {
            socket.emit(RoomEvents.JoinError, JoinErrors.RoomDeleted);
            return false;
        } else if (room.room.isLocked) {
            socket.emit(RoomEvents.JoinError, JoinErrors.RoomLocked);
            return false;
        }
        return true;
    }

    private sendAvatarData(socket: Socket, roomId: string) {
        const selectedAvatar = this.avatarManagerService.getAvatarBySocketId(roomId, socket.id);
        const avatarList = this.avatarManagerService.getTakenAvatarsByRoomCode(roomId);
        socket.emit(RoomEvents.AvatarSelected, selectedAvatar);
        this.server.to(roomId).emit(RoomEvents.AvailableAvatars, avatarList);
    }
}
