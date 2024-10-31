import { INITIAL_NAME_EXTENSION } from '@app/constants/player-creation.constants';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { SocketData } from '@app/interfaces/socket-data';
import { Map } from '@app/model/database/map';
import { AvatarManagerService } from '@app/services/avatar-manager/avatar-manager.service';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/constants/gateway.constants';
import { AvatarChoice, PlayerRole } from '@common/constants/player.constants';
import { JoinErrors } from '@common/interfaces/join-errors';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AvatarData } from '@common/interfaces/avatar-data';

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
        private chatGateway: ChatGateway,
    ) {
        this.socketManagerService.setGatewayServer(Gateway.ROOM, this.server);
    }

    @SubscribeMessage(RoomEvents.Create)
    handleCreateRoom(socket: Socket, data: { roomId: string; map: Map; avatar: AvatarChoice }) {
        this.avatarManagerService.initializeAvatarList(data.roomId, data.avatar, socket.id);
        this.socketManagerService.assignNewRoom(data.roomId);
        this.roomManagerService.assignMapToRoom(data.roomId, data.map);
    }

    @SubscribeMessage(RoomEvents.PlayerCreationOpened)
    handlePlayerCreationOpened(socket: Socket, roomCode: string) {
        socket.join(roomCode);
        this.avatarManagerService.setStartingAvatar(roomCode, socket.id);
        this.sendAvatarData(socket, roomCode);
    }

    @SubscribeMessage(RoomEvents.DesiredAvatar)
    handleDesiredAvatar(socket: Socket, desiredAvatar: AvatarChoice) {
        const roomCode = this.socketManagerService.getSocketRoom(socket).room.roomCode;
        console.log(roomCode);
        console.log(desiredAvatar);
        this.avatarManagerService.toggleAvatarTaken(roomCode, desiredAvatar, socket.id);
        this.sendAvatarData(socket, roomCode);
    }

    sendAvatarData(socket: Socket, roomId: string) {
        const selectedAvatar = this.avatarManagerService.getAvatarBySocketId(roomId, socket.id);
        const avatarData: AvatarData = {
            avatarList: this.avatarManagerService.getAvatarsByRoomCode(roomId),
            selectedAvatar: selectedAvatar,
        };
        this.logger.log(avatarData.selectedAvatar);
        this.logger.log(avatarData.avatarList);
        socket.emit(RoomEvents.AvailableAvatars, avatarData);
    }

    @SubscribeMessage(RoomEvents.PlayerCreationClosed)
    handlePlayerCreationClosed(socket: Socket, data: { roomId: string; isOrganizer: boolean }) {
        const { roomId, isOrganizer } = data;
        if (!isOrganizer) {
            this.avatarManagerService.removeSocket(roomId, socket.id);
            socket.emit(RoomEvents.AvailableAvatars, this.avatarManagerService.getAvatarsByRoomCode(roomId));
        }
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

        const olderMessages = this.chatManagerService.fetchOlderMessages(roomId);
        this.chatGateway.sendChatHistory(olderMessages, socket, roomId);
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

    disconnectPlayer(roomCode: string, playerName: string) {
        const player = this.roomManagerService.getPlayerInRoom(roomCode, playerName);
        const room = this.roomManagerService.getRoom(roomCode);
        if (!(room && player)) return;

        if (this.roomManagerService.isPlayerLimitReached(roomCode)) {
            this.server.to(roomCode).emit(RoomEvents.PlayerLimitReached, false);
        } // If player limit was reached before removal, we inform the clients that it is not anymore.

        this.roomManagerService.removePlayerFromRoom(roomCode, playerName);

        if (player.playerInfo.role === PlayerRole.ORGANIZER) {
            this.server.to(roomCode).emit(RoomEvents.RoomClosed);
            this.roomManagerService.deleteRoom(roomCode);
        } else {
            this.server.to(roomCode).emit(RoomEvents.RemovePlayer, playerName);
        }

        this.socketManagerService.handleLeavingSockets(roomCode, playerName);
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
}
