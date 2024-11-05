import { GameStats, GameTimer } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { SocketData } from '@app/interfaces/socket-data';
import { Map as GameMap } from '@app/model/database/map';
import { Room } from '@app/model/database/room';
import { RoomService } from '@app/services/room/room.service';
import { MAP_PLAYER_CAPACITY } from '@common/constants/game-map.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
import { Injectable } from '@nestjs/common';

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
            game: {
                map: new GameMap(),
                winner: '',
                mode: GameMode.NORMAL,
                currentPlayer: '',
                hasPendingAction: false,
                status: GameStatus.OverWorld,
                stats: {} as GameStats,
                timer: {} as GameTimer,
                isTurnChange: false,
                isDebugMode: false,
            },
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
        return this.getRoom(roomCode)?.players?.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName) ?? null;
    }

    getCurrentRoomPlayer(roomCode: string): Player | null {
        const room = this.getRoom(roomCode);
        if (!room) return null;
        return this.getPlayerInRoom(room.room.roomCode, room.game.currentPlayer);
    }

    getAllRoomPlayers(roomCode: string): Player[] | null {
        return this.getRoom(roomCode)?.players;
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
        return room.players.length === MAP_PLAYER_CAPACITY[mapSize];
    }

    handleJoiningSocketEmissions(socketData: SocketData) {
        const { server, socket, player, roomId } = socketData;
        const room = this.getRoom(roomId);

        socket.emit(RoomEvents.Join, player);
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
}
