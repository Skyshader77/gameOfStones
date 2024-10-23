import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameTurnService {
    constructor(private roomManagerService: RoomManagerService) {}

    nextTurn(roomCode: string): string | null {
        const room = this.roomManagerService.getRoom(roomCode);
        if (!room) return null;

        room.game.currentPlayer = (room.game.currentPlayer + 1) % room.players.length;

        return room.players[room.game.currentPlayer].playerInfo.userName;
    }
}
