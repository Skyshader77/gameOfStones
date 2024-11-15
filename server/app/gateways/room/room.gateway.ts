import { INITIAL_NAME_EXTENSION } from '@app/constants/player-creation.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { SocketData } from '@app/interfaces/socket-data';
import { Map } from '@app/model/database/map';
import { AvatarManagerService } from '@app/services/avatar-manager/avatar-manager.service';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { VirtualPlayerCreationService } from '@app/services/virtual-player-creation/virtual-player-creation.service';
import { Avatar } from '@common/enums/avatar.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JoinErrors } from '@common/enums/join-errors.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
import { Player } from '@common/interfaces/player';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CLEANUP_MESSAGE, CREATION_MESSAGE } from './room.gateway.constants';

@WebSocketGateway({ namespace: `/${Gateway.ROOM}`, cors: true })
@Injectable()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    @Inject() private virtualPlayerCreationService: VirtualPlayerCreationService;
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
    handleCreateRoom(socket: Socket, data: { roomCode: string; map: Map; avatar: Avatar }) {
        this.avatarManagerService.initializeAvatarList(data.roomCode, data.avatar, socket.id);
        this.socketManagerService.assignNewRoom(data.roomCode);
        this.roomManagerService.assignMapToRoom(data.roomCode, data.map);
        this.logger.log(CREATION_MESSAGE + data.roomCode);
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
        if (!roomCode) return;
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

    @SubscribeMessage(RoomEvents.DesireAddVirtualPlayer)
    handleDesireAddVirtualPlayer(socket: Socket, playerRole: PlayerRole) {
        const room = this.socketManagerService.getSocketRoom(socket);
        if (!this.checkIfRoomIsValid(socket, room)) return;
        const virtualPlayer = this.virtualPlayerCreationService.createVirtualPlayer(room, playerRole);
        this.roomManagerService.addPlayerToRoom(room.room.roomCode, virtualPlayer);

        this.server.to(room.room.roomCode).emit(RoomEvents.AddPlayer, virtualPlayer);

        if (this.roomManagerService.isPlayerLimitReached(room.room.roomCode)) {
            room.room.isLocked = true;
            this.server.to(room.room.roomCode).emit(RoomEvents.RoomLocked, true);
            this.server.to(room.room.roomCode).emit(RoomEvents.PlayerLimitReached, true);
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
    desireKickPlayer(socket: Socket, kickedPlayerName: string) {
        const room = this.socketManagerService.getSocketRoom(socket);

        if (room && kickedPlayerName) {
            const kickerName = this.socketManagerService.getSocketPlayerName(socket);
            const kickedSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, kickedPlayerName, Gateway.ROOM);

            if (
                kickerName &&
                room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === kickerName).playerInfo.role === PlayerRole.Organizer
            ) {
                const roomCode = room.room.roomCode;
                this.playerLeavingCleanUp(roomCode, kickedPlayerName, kickedSocket);
            }
        }
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
        const player = this.roomManagerService.getPlayerInRoom(room.room.roomCode, playerName);
        if (room && room.game.status === GameStatus.Waiting) {
            this.disconnectPlayer(room.room.roomCode, playerName);
            if ([PlayerRole.AggressiveAI, PlayerRole.DefensiveAI].includes(player.playerInfo.role)) {
                this.avatarManagerService.freeVirtualPlayerAvatar(room.room.roomCode, player.playerInfo.avatar);
            } else {
                this.avatarManagerService.removeSocket(roomCode, socket.id);
            }
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
            this.logger.log(CLEANUP_MESSAGE + roomCode);
        } else {
            this.roomManagerService.removePlayerFromRoom(roomCode, playerName);
            this.server.to(roomCode).emit(RoomEvents.RemovePlayer, playerName);
        }

        this.socketManagerService.handleLeavingSockets(roomCode, playerName);
    }

    private generateUniquePlayerName(room: RoomGame, baseName: string): string {
        let playerName = baseName;
        let count = INITIAL_NAME_EXTENSION;

        while (!this.roomManagerService.checkIfNameIsUnique(room, playerName)) {
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
        const avatarsTakenState = this.avatarManagerService.getTakenAvatarsByRoomCode(roomId);
        socket.emit(RoomEvents.AvatarSelected, selectedAvatar);
        this.server.to(roomId).emit(RoomEvents.AvailableAvatars, avatarsTakenState);
    }
}
