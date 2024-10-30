import { Game } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Injectable } from '@nestjs/common';
import { RoomService } from '@app/services/room/room.service';
import { Map as GameMap } from '@app/model/database/map';
import { MapSize } from '@app/interfaces/map-size';
import { LARGE_MAP_PLAYER_CAPACITY, MEDIUM_MAP_PLAYER_CAPACITY, SMALL_MAP_PLAYER_CAPACITY } from '@common/constants/game-map.constants';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { SocketData } from '@app/interfaces/socket-data';

@Injectable()
export class RoomManagerService {
    private rooms: Map<string, RoomGame>;

    constructor(private roomService: RoomService) {
        this.rooms = new Map<string, RoomGame>();
    }

    createRoom(roomId: string) {
        const newRoom: RoomGame = {
            room: { roomCode: roomId },
            players: [],
            chatList: [],
            journal: [],
            isLocked: false,
            game: new Game(),
        };
        this.addRoom(newRoom);
    }

    addRoom(room: RoomGame) {
        this.rooms.set(room.room.roomCode, room);
        // TODO do the room db operations here maybe?
    }

    assignMapToRoom(roomId: string, map: GameMap) {
        const room = this.getRoom(roomId);
        if (room) {
            room.game.map = map;
        }
    }

    deleteRoom(roomCode: string) {
        this.rooms.delete(roomCode);
        this.roomService.deleteRoomByCode(roomCode);
    }

    getRoom(roomCode: string): RoomGame | null {
        return this.rooms.get(roomCode);
    }

    addPlayerToRoom(roomCode: string, player: Player) {
        const room = this.getRoom(roomCode);
        if (!room) {
            throw new Error(`Room with code ${roomCode} does not exist`);
        }
        room.players.push(player);
    }

    removePlayerFromRoom(roomCode: string, playerName: string) {
        const room = this.getRoom(roomCode);
        if (room) {
            room.players = room.players.filter((existingPlayer) => existingPlayer.playerInfo.userName !== playerName);
        }
    }

    updateRoom(roomCode: string, roomGame: RoomGame) {
        this.rooms.set(roomCode, roomGame);
    }

    isPlayerLimitReached(roomCode: string) {
        const room = this.getRoom(roomCode);
        const mapSize: MapSize = room.game.map.size;
        switch (mapSize) {
            case MapSize.SMALL:
                return room.players.length === SMALL_MAP_PLAYER_CAPACITY;
            case MapSize.MEDIUM:
                return room.players.length === MEDIUM_MAP_PLAYER_CAPACITY;
            case MapSize.LARGE:
                return room.players.length === LARGE_MAP_PLAYER_CAPACITY;
        }
    }

    handleJoiningSocketEmissions(socketData: SocketData) {
        const { server, socket, player, roomId } = socketData;
        const room = this.getRoom(roomId);

        socket.emit(RoomEvents.Join, player);
        socket.emit(RoomEvents.PlayerList, room.players);
        socket.to(room.room.roomCode).emit(RoomEvents.AddPlayer, player);

        if (this.isPlayerLimitReached(roomId)) {
            room.isLocked = true;
            server.to(room.room.roomCode).emit(RoomEvents.RoomLocked, true);
            server.to(room.room.roomCode).emit(RoomEvents.PlayerLimitReached, true);
        } else {
            socket.emit(RoomEvents.RoomLocked, false);
        }
    }

    // TODO add room manipulations here. maybe do db stuff here as well.
}
