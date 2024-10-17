import { Gateway } from '@app/constants/gateways.constants';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { RoomGame } from '@app/interfaces/roomGame';

@Injectable()
export class SocketManagerService {
    private sockets: Map<string, Map<string, PlayerSocketIndices>>;
    private servers: Map<Gateway, Server>;

    constructor(private roomManagerService: RoomManagerService) {
        this.sockets = new Map<string, Map<string, PlayerSocketIndices>>();
        this.servers = new Map<Gateway, Server>();
    }

    get socketMap(): Map<string, Map<string, PlayerSocketIndices>> {
        return this.sockets;
    }

    setGatewayServer(gateway: Gateway, server: Server) {
        this.servers.set(gateway, server);
    }

    assignNewRoom(roomId: string) {
        if (!this.sockets.has(roomId)) {
            this.sockets.set(roomId, new Map<string, PlayerSocketIndices>());
            this.roomManagerService.createRoom(roomId);
        }
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

    assignSocketsToPlayer(roomCode: string, playerName: string, socketIdx: PlayerSocketIndices) {
        this.sockets.get(roomCode).set(playerName, socketIdx);
    }

    getPlayerSocket(roomCode: string, playerName: string, gateway: Gateway): Socket | undefined {
        const socketIdx = this.sockets.get(roomCode).get(playerName);
        return this.servers.get(gateway)?.sockets.sockets.get(socketIdx[gateway]);
    }
}
