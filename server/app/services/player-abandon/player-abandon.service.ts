import { RoomGame } from '@app/interfaces/room-game';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { PlayerRole } from '@common/enums/player-role.enum';
import { Player } from '@common/interfaces/player';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerAbandonService {
    constructor(private socketManagerService: SocketManagerService) {}

    processPlayerAbandonment(room: RoomGame, playerName: string): boolean {
        const deserter = room.players.find((player: Player) => player.playerInfo.userName === playerName);

        if (deserter) {
            if (deserter.playerInfo.role === PlayerRole.Organizer) {
                room.game.isDebugMode = false;
            }
            deserter.playerInGame.hasAbandoned = true;
            this.socketManagerService.handleLeavingSockets(room.room.roomCode, playerName);
            return true;
        }
        return false;
    }

    getRemainingPlayerCount(players: Player[]): number {
        let count = 0;
        players.forEach((player) => {
            if (!player.playerInGame.hasAbandoned) count++;
        });
        return count;
    }

    hasCurrentPlayerAbandoned(room: RoomGame) {
        const currentPlayer = room.players.find((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        return currentPlayer?.playerInGame.hasAbandoned;
    }
}
