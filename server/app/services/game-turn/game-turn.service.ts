import { Player } from '@app/interfaces/player';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameTurnService {
    constructor(private roomManagerService: RoomManagerService) {}
    nextTurn(roomCode: string, playerName: string): string | null {
        const room = this.roomManagerService.getRoom(roomCode);

        if (!room) return null;

        let index = room.players.findIndex((player: Player) => player.playerInfo.userName === playerName);

        if (index === -1 || index !== room.game.currentPlayer) return null;

        do {
            index = (index + 1) % room.players.length;
        } while (room.players[index].playerInGame.hasAbandonned && index !== room.game.currentPlayer);

        room.game.currentPlayer = index;

        return room.players[index].playerInfo.userName;
    }
}
