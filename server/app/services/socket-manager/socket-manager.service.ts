import { Gateway } from '@common/constants/gateway.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class SocketManagerService {
    // Map<roomCode, Map<playerName, PlayerSocketIndices>>
    private playerSockets: Map<string, Map<string, PlayerSocketIndices>>;
    private sockets: Map<string, Socket>;
    private servers: Map<Gateway, Server>;

    constructor(private roomManagerService: RoomManagerService) {
        this.playerSockets = new Map<string, Map<string, PlayerSocketIndices>>();
        this.servers = new Map<Gateway, Server>();
        this.sockets = new Map<string, Socket>();
    }

    get playerSocketMap(): Map<string, Map<string, PlayerSocketIndices>> {
        return this.playerSockets;
    }

    registerSocket(socket: Socket) {
        this.sockets.set(socket.id, socket);
    }

    unregisterSocket(socket: Socket) {
        this.sockets.delete(socket.id);
    }

    setGatewayServer(gateway: Gateway, server: Server) {
        this.servers.set(gateway, server);
    }

    assignNewRoom(roomCode: string) {
        if (!this.sockets.has(roomCode)) {
            this.playerSockets.set(roomCode, new Map<string, PlayerSocketIndices>());
            this.roomManagerService.createRoom(roomCode);
        }
    }

    deleteRoom(roomCode: string) {
        this.roomManagerService.getAllRoomPlayers(roomCode)?.forEach((player) => this.handleLeavingSockets(roomCode, player.playerInfo.userName));
        this.playerSocketMap.delete(roomCode);
    }

    getSocketRoomCode(socket: Socket): string | null {
        const roomCodes: string[] = [...socket.rooms].filter((room) => room !== socket.id);
        if (roomCodes.length > 0) {
            return roomCodes[0];
        } else {
            return null;
        }
    }

    getSocketRoom(socket: Socket): RoomGame | null {
        const roomCode = this.getSocketRoomCode(socket);
        if (roomCode) {
            return this.roomManagerService.getRoom(roomCode);
        } else {
            return null;
        }
    }

    getSocketPlayerName(socket: Socket): string | null {
        const roomCode = this.getSocketRoomCode(socket);
        if (roomCode) {
            let playerName: string;
            this.playerSockets.get(roomCode).forEach((indices, name) => {
                if (indices.messaging === socket.id || indices.game === socket.id || indices.room === socket.id) {
                    playerName = name;
                }
            });
            return playerName;
        }
        return null;
    }

    getDisconnectedPlayerName(roomCode: string, socket: Socket): string | null {
        if (roomCode) {
            let playerName: string;
            this.playerSockets?.get(roomCode)?.forEach((indices, name) => {
                if (indices.messaging === socket.id || indices.game === socket.id || indices.room === socket.id) {
                    playerName = name;
                }
            });
            return playerName;
        }
        return null;
    }

    getPlayerSocket(roomCode: string, playerName: string, gateway: Gateway): Socket | undefined {
        const socketIdx = this.playerSockets.get(roomCode)?.get(playerName);
        return socketIdx ? this.sockets.get(socketIdx[gateway]) : undefined;
    }

    handleJoiningSockets(roomCode: string, playerName: string, socketIdx: PlayerSocketIndices) {
        this.playerSockets.get(roomCode).set(playerName, socketIdx);
        for (const gateway of Object.values(Gateway)) {
            const playerSocket = this.getPlayerSocket(roomCode, playerName, gateway);
            if (playerSocket) {
                playerSocket.join(roomCode);
            }
        }
    }

    handleLeavingSockets(roomCode: string, playerName: string) {
        for (const gateway of Object.values(Gateway)) {
            const playerSocket = this.getPlayerSocket(roomCode, playerName, gateway);
            if (playerSocket) {
                playerSocket.leave(roomCode);
            }
        }

        const roomPlayerSockets = this.playerSockets.get(roomCode);
        if (roomPlayerSockets && roomPlayerSockets.has(playerName)) {
            roomPlayerSockets.delete(playerName);
        }
    }
}
