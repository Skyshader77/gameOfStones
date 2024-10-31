import { Game } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { AvatarChoice } from '@common/constants/player.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { Map as GameMap } from '@app/model/database/map';
import { Room } from '@app/model/database/room';
import { RoomService } from '@app/services/room/room.service';
import { Injectable } from '@nestjs/common';
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
            room: { roomCode: roomId, isLocked: false },
            players: [],
            chatList: [],
            journal: [],
            game: new Game(),
        };
        this.addRoom(newRoom);
    }

    addRoom(room: RoomGame) {
        this.rooms.set(room.room.roomCode, room);
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

    getPlayerInRoom(roomCode: string, playerName: string): Player | null {
        return this.getRoom(roomCode)?.players?.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);
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

    toggleIsLocked(room: Room) {
        room.isLocked = !room.isLocked;
        this.roomService.modifyRoom(room);
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
        socket.emit(RoomEvents.AvailableAvatars, this.getAvailableAvatars(room))
        socket.emit(RoomEvents.PlayerList, room.players);
        socket.to(room.room.roomCode).emit(RoomEvents.AddPlayer, player);

        if (this.isPlayerLimitReached(roomId)) {
            room.room.isLocked = true;
            server.to(room.room.roomCode).emit(RoomEvents.RoomLocked, true);
            server.to(room.room.roomCode).emit(RoomEvents.PlayerLimitReached, true);
        } else {
            socket.emit(RoomEvents.RoomLocked, false);
        }
    }

    getAvailableAvatars(room: RoomGame): AvatarChoice[] {
        const existingAvatars = room.players.map(p => p.playerInfo.avatar);
        return Object.values(AvatarChoice).filter(avatar => !existingAvatars.includes(avatar));
    }

    getPreselectedAvatar(room: RoomGame): AvatarChoice | null {
        const availableAvatars = this.getAvailableAvatars(room);
        return availableAvatars.length > 0 ? availableAvatars[0] : null;
    }

    // TODO add room manipulations here. maybe do db stuff here as well.
}
