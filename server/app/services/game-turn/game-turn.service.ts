import { RoomGame } from '@app/interfaces/room-game';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GameTurnService {
    constructor(private logger: Logger) {}
    nextTurn(room: RoomGame): string | null {
        const initialCurrentPlayer = room.game.currentPlayer;

        do {
            room.game.currentPlayer = (room.game.currentPlayer + 1) % room.players.length;
        } while (room.players[room.game.currentPlayer].playerInGame.hasAbandonned && room.game.currentPlayer !== initialCurrentPlayer);

        if (initialCurrentPlayer === room.game.currentPlayer) {
            this.logger.error('All players have abandoned in room ' + room.room.roomCode);
            return null;
        }

        return room.players[room.game.currentPlayer].playerInfo.userName;
    }
}
