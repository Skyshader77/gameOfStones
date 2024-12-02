import { VirtualPlayerState } from '@app/interfaces/ai-state';
import { GameTimer } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { SocketData } from '@app/interfaces/socket-data';
import { GameStats } from '@app/interfaces/statistics';
import { Map as GameMap } from '@app/model/database/map';
import { Room } from '@app/model/database/room';
import { RoomService } from '@app/services/room/room.service';
import { MAP_PLAYER_CAPACITY } from '@common/constants/game-map.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { RoomEvents } from '@common/enums/sockets-events/room.events';
import { Player } from '@common/interfaces/player';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RoomManagerService {
    private rooms: Map<string, RoomGame>;

    constructor(private roomService: RoomService) {
        this.rooms = new Map<string, RoomGame>();
    }

    createRoom(roomCode: string) {
        const newRoom: RoomGame = {
            room: { roomCode, isLocked: false },
            players: [],
            chatList: [],
            journal: [],
            game: {
                map: new GameMap(),
                winner: '',
                mode: GameMode.Normal,
                currentPlayer: '',
                isCurrentPlayerDead: false,
                removedSpecialItems: [],
                hasPendingAction: false,
                status: GameStatus.Waiting,
                stats: {} as GameStats,
                timer: {} as GameTimer,
                virtualState: {} as VirtualPlayerState,
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
            room.game.mode = map.mode;
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
        return !room ? null : this.getPlayerInRoom(room.room.roomCode, room.game.currentPlayer);
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
        const { server, socket, player, roomCode } = socketData;
        const room = this.getRoom(roomCode);

        socket.emit(RoomEvents.Join, player);
        socket.emit(RoomEvents.PlayerList, room.players);
        socket.to(roomCode).emit(RoomEvents.AddPlayer, player);

        this.handlePlayerLimit(server, room);
    }

    handlePlayerLimit(server: Server, room: RoomGame) {
        room.room.isLocked = this.isPlayerLimitReached(room.room.roomCode);
        if (room.room.isLocked) {
            server.to(room.room.roomCode).emit(RoomEvents.PlayerLimitReached, true);
        }
        server.to(room.room.roomCode).emit(RoomEvents.RoomLocked, room.room.isLocked);
    }

    checkIfNameIsUnique(room: RoomGame, playerName: string) {
        return !room.players.some((player) => player.playerInfo.userName === playerName);
    }

    getCurrentPlayerRole(room: RoomGame) {
        if (!room) return null;
        return this.getPlayerInRoom(room.room.roomCode, room.game.currentPlayer).playerInfo.role;
    }
}
