import { Player } from '@app/interfaces/player';
import { Injectable } from '@nestjs/common';
import { RoomGame } from '@app/interfaces/room-game';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';

@Injectable()
export class PlayerAbandonService {
    constructor(private socketManagerService: SocketManagerService) {}
    processPlayerAbandonment(room: RoomGame, playerName: string): boolean {
        const deserter = room.players.find((player: Player) => player.playerInfo.userName === playerName);
        if (deserter) {
            deserter.playerInGame.hasAbandonned = true;
            this.socketManagerService.handleLeavingSockets(room.room.roomCode, playerName);
            return true;
        }
        return false;
    }

    hasCurrentPlayerAbandoned(room: RoomGame) {
        const currentPlayer = room.players.find((player: Player) => player.playerInfo.userName === room.game.currentPlayer);

        return currentPlayer.playerInGame.hasAbandonned;
    }
}
