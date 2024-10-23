import { Game } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Injectable } from '@nestjs/common';
import { RoomService } from '@app/services/room/room.service';

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

    // TODO add room manipulations here. maybe do db stuff here as well.
}
