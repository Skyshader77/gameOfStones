import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GameTurnService {
    constructor(private logger: Logger) {}
    nextTurn(room: RoomGame): string | null {
        const initialCurrentPlayer = room.game.currentPlayer;
        let currentPlayerIndex = room.players.findIndex((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        do {
            currentPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
        } while (room.players[currentPlayerIndex].playerInGame.hasAbandonned && room.players[currentPlayerIndex].playerInfo.userName !== initialCurrentPlayer);

        if (initialCurrentPlayer === room.players[currentPlayerIndex].playerInfo.userName) {
            this.logger.error('All players have abandoned in room ' + room.room.roomCode);
            return null;
        }

        room.game.currentPlayer=room.players[currentPlayerIndex].playerInfo.userName;
        return room.players[currentPlayerIndex].playerInfo.userName;
    }
}
