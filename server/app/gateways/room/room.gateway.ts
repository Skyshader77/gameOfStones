import { INITIAL_NAME_EXTENSION } from '@app/constants/player-creation.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { SocketData } from '@app/interfaces/socket-data';
import { AvatarManagerService } from '@app/services/avatar-manager/avatar-manager.service';
import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { VirtualPlayerCreationService } from '@app/services/virtual-player-creation/virtual-player-creation.service';
import { isPlayerHuman } from '@app/utils/utilities';
import { Avatar } from '@common/enums/avatar.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JoinErrors } from '@common/enums/join-errors.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { RoomEvents } from '@common/enums/sockets-events/room.events';
import { RoomCreationPayload, RoomJoinPayload } from '@common/interfaces/room-payloads';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CLEANUP_MESSAGE, CREATION_MESSAGE } from './room.gateway.constants';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
import { VirtualPlayerBehaviorService } from '@app/services/virtual-player-behavior/virtual-player-behavior.service';
import { Player } from '@common/interfaces/player';

@WebSocketGateway({ namespace: `/${Gateway.Room}`, cors: true })
@Injectable()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private chatManagerService: ChatManagerService;
    @Inject() private avatarManagerService: AvatarManagerService;
    @Inject() private virtualPlayerBehaviorService: VirtualPlayerBehaviorService;
    @Inject() private virtualPlayerCreationService: VirtualPlayerCreationService;
    @Inject() private virtualPlayerStateService: VirtualPlayerStateService;
    private readonly logger: Logger = new Logger(RoomGateway.name);

    @SubscribeMessage(RoomEvents.Create)
    handleCreateRoom(socket: Socket, payload: RoomCreationPayload) {
        this.avatarManagerService.initializeAvatarList(payload.roomCode, payload.avatar, socket.id);
        this.socketManagerService.assignNewRoom(payload.roomCode);
        this.roomManagerService.assignMapToRoom(payload.roomCode, payload.map);
        this.logger.log(CREATION_MESSAGE + payload.roomCode);
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
    handlePlayerCreationClosed(socket: Socket, roomCode: string) {
        this.avatarManagerService.removeSocket(roomCode, socket.id);
        socket.leave(roomCode);
        this.server.to(roomCode).emit(RoomEvents.AvailableAvatars, this.avatarManagerService.getTakenAvatarsByRoomCode(roomCode));
    }

    @SubscribeMessage(RoomEvents.DesireJoinRoom)
    handleDesireJoinRoom(socket: Socket, payload: RoomJoinPayload) {
        const { roomCode, playerSocketIndices, player } = payload;
        const room = this.roomManagerService.getRoom(roomCode);
        if (!this.checkIfRoomIsValid(socket, room)) return;
        player.playerInfo.userName = this.generateUniquePlayerName(room, player.playerInfo.userName);
        socket.data.roomCode = roomCode;
        this.socketManagerService.handleJoiningSockets(roomCode, player.playerInfo.userName, playerSocketIndices);
        this.roomManagerService.addPlayerToRoom(roomCode, player);
        const socketData: SocketData = { server: this.server, socket, player, roomCode };
        this.roomManagerService.handleJoiningSocketEmissions(socketData);

        const chatSocket = this.socketManagerService.getPlayerSocket(roomCode, player.playerInfo.userName, Gateway.Messaging);
        if (chatSocket) this.chatManagerService.sendChatHistory(chatSocket, roomCode);
    }

    @SubscribeMessage(RoomEvents.DesireAddVirtualPlayer)
    handleDesireAddVirtualPlayer(socket: Socket, playerRole: PlayerRole) {
        const room = this.socketManagerService.getSocketRoom(socket);
        if (!this.checkIfRoomIsValid(socket, room)) return;
        const virtualPlayer = this.virtualPlayerCreationService.createVirtualPlayer(room, playerRole);

        this.roomManagerService.addPlayerToRoom(room.room.roomCode, virtualPlayer);
        this.virtualPlayerStateService.initializeVirtualPlayerState(room);
        this.virtualPlayerBehaviorService.initializeRoomForVirtualPlayers(room);

        this.server.to(room.room.roomCode).emit(RoomEvents.AddPlayer, virtualPlayer);

        this.roomManagerService.handlePlayerLimit(this.server, room);

        this.sendAvatarData(socket, room.room.roomCode);
    }

    @SubscribeMessage(RoomEvents.DesireToggleLock)
    handleToggleRoomLock(socket: Socket, roomCode: string) {
        const room = this.roomManagerService.getRoom(roomCode);

        if (room) {
            if (this.roomManagerService.isPlayerLimitReached(roomCode)) return;
            const playerName = this.socketManagerService.getSocketPlayerName(socket);

            const player = room.players.find((roomPlayer) => {
                return roomPlayer.playerInfo.userName === playerName;
            });

            if (player && player.playerInfo.role === PlayerRole.Organizer) {
                this.roomManagerService.toggleIsLocked(room.room);
                this.server.to(roomCode).emit(RoomEvents.RoomLocked, room.room.isLocked);
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
            const kickedSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, kickedPlayerName, Gateway.Room);

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
            if (!isPlayerHuman(player)) {
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

        this.removePlayer(roomCode, player);

        this.socketManagerService.handleLeavingSockets(roomCode, playerName);
    }

    private removePlayer(roomCode: string, player: Player) {
        if (player.playerInfo.role === PlayerRole.Organizer) {
            this.server.to(roomCode).emit(RoomEvents.RoomClosed);
            const virtualState = this.virtualPlayerStateService.getVirtualState(this.roomManagerService.getRoom(roomCode).game);
            if (virtualState.aiTurnSubscription) {
                virtualState.aiTurnSubscription.unsubscribe();
            }
            this.socketManagerService.deleteRoom(roomCode);
            this.roomManagerService.deleteRoom(roomCode);
            this.logger.log(CLEANUP_MESSAGE + roomCode);
        } else {
            this.roomManagerService.removePlayerFromRoom(roomCode, player.playerInfo.userName);
            this.server.to(roomCode).emit(RoomEvents.RemovePlayer, player.playerInfo.userName);
        }
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

    private sendAvatarData(socket: Socket, roomCode: string) {
        const selectedAvatar = this.avatarManagerService.getAvatarBySocketId(roomCode, socket.id);
        const avatarsTakenState = this.avatarManagerService.getTakenAvatarsByRoomCode(roomCode);
        socket.emit(RoomEvents.AvatarSelected, selectedAvatar);
        this.server.to(roomCode).emit(RoomEvents.AvailableAvatars, avatarsTakenState);
    }
}
