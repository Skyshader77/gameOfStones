import { RoomGame } from '@app/interfaces/roomGame';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomManagerService {
    private rooms: Map<string, RoomGame>;

    addRoom(room: RoomGame) {
        this.rooms.set(room.room.roomCode, room);
        // TODO do the room db operations here maybe?
    }

    getRoom(roomCode: string): RoomGame | null {
        return this.rooms.get(roomCode);
    }

    updateRoom(roomCode: string, roomGame: RoomGame) {
        this.rooms.set(roomCode, roomGame);
    }

    // TODO add room manipulations here. maybe do db stuff here as well.
}
