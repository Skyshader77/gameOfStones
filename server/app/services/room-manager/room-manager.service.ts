import { Game } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/roomGame';
import { Injectable } from '@nestjs/common';
import { RoomService } from '@app/services/room/room.service';
import { Player } from '@app/interfaces/player';

@Injectable()
export class RoomManagerService {
    private rooms: Map<string, RoomGame>;

    constructor(private roomService: RoomService) {}

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
        this.roomService.addRoom(room);
        // TODO do the room db operations here maybe?
    }

    getRoom(roomCode: string): RoomGame | null {
        return this.rooms.get(roomCode);
    }

    addPlayerToRoom(roomCode: string, player: Player) {
        this.getRoom(roomCode).players.push(player);
    }

    // TODO add room manipulations here. maybe do db stuff here as well.
}
