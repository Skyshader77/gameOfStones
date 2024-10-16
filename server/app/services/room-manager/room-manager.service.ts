import { Room } from '@app/interfaces/room';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomManagerService {
    private rooms: Map<string, Room>;

    addRoom(room: Room) {
        this.rooms.set(room.code, room);
        // TODO probably do the database manipulations from here. to see
    }

    getRoom(roomCode: string): Room | null {
        return this.rooms.get(roomCode);
    }

    // TODO add room manipulations here
}
