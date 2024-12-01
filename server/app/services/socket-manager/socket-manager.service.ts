import { RoomGame } from '@app/interfaces/room-game';
import { SocketInformation } from '@app/interfaces/socket-information';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { Player } from '@common/interfaces/player';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class SocketManagerService {
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

    getGatewayServer(gateway: Gateway): Server {
        return this.servers.get(gateway);
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
        return roomCodes.length > 0 ? roomCodes[0] : null;
    }

    getSocketRoom(socket: Socket): RoomGame | null {
        const roomCode = this.getSocketRoomCode(socket);
        return roomCode ? this.roomManagerService.getRoom(roomCode) : null;
    }

    getSocketPlayerName(socket: Socket): string | null {
        const roomCode = this.getSocketRoomCode(socket);
        if (roomCode) {
            let playerName: string | null = null;
            this.playerSockets.get(roomCode).forEach((indices, name) => {
                if (indices.messaging === socket.id || indices.game === socket.id || indices.room === socket.id || indices.fight === socket.id) {
                    playerName = name;
                }
            });
            return playerName || null;
        }
        return null;
    }

    getSocketInformation(socket: Socket): SocketInformation {
        return { room: this.getSocketRoom(socket), playerName: this.getSocketPlayerName(socket) };
    }

    isSocketCurrentPlayer(info: SocketInformation): boolean {
        return info.playerName === info.room.game.currentPlayer;
    }

    getDisconnectedPlayerName(roomCode: string, socket: Socket): string | null {
        if (roomCode) {
            let playerName: string | null = null;
            this.playerSockets?.get(roomCode)?.forEach((indices, name) => {
                if (indices.messaging === socket.id || indices.game === socket.id || indices.room === socket.id) {
                    playerName = name;
                }
            });
            return playerName || null;
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

    setGameSocketsRoomCode(roomCode: string, players: Player[]) {
        players.forEach((player) => {
            const playerGameSocket = this.getPlayerSocket(roomCode, player.playerInfo.userName, Gateway.Game);
            if (playerGameSocket) {
                playerGameSocket.data.roomCode = roomCode;
            }
        });
    }
}
