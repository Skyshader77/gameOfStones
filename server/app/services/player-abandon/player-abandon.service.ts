import { Player } from '@app/interfaces/player';
import { Injectable } from '@nestjs/common';
import { RoomGame } from '@app/interfaces/room-game';

@Injectable()
export class PlayerAbandonService {
    processPlayerAbandonment(room: RoomGame, playerName: string): boolean {
        const deserter = room.players.find((player: Player) => player.playerInfo.userName === playerName);
        if (deserter) {
            deserter.playerInGame.hasAbandonned = true;
            return true;
        }
        return false;
    }

    hasCurrentPlayerAbandoned(room: RoomGame) {
        const currentPlayer = room.players.find((player: Player) => player.playerInfo.userName === room.game.currentPlayer);

        return currentPlayer.playerInGame.hasAbandonned;
    }
}
