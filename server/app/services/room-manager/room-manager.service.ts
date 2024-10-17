import { Room } from '@app/interfaces/room';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomManagerService {
    private rooms: Map<string, Room>;

    addRoom(room: Room) {
        this.rooms.set(room.code, room);
        // TODO do the room db operations here maybe?
    }

    getRoom(roomCode: string): Room | null {
        return this.rooms.get(roomCode);
    }

    // TODO add room manipulations here. maybe do db stuff here as well.
}
