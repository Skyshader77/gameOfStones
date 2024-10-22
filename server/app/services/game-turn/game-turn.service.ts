import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameTurnService {
    constructor(private roomManagerService: RoomManagerService) {}
    setNextActivePlayer(roomCode: string, currentPlayerName: string): string | undefined {
        const room = this.roomManagerService.getRoom(roomCode);
        if (!room) return;

        const currentPlayerIndex = room.players.findIndex((player) => player.playerInfo.userName === currentPlayerName);

        let nextPlayerIndex = currentPlayerIndex;
        let loopCount = 0;
        do {
            nextPlayerIndex = (nextPlayerIndex + 1) % room.players.length;
            loopCount++;
            if (loopCount > room.players.length) {
                return undefined;
            }
        } while (room.players[nextPlayerIndex].playerInGame.hasAbandonned);

        const nextPlayerName = room.players[nextPlayerIndex].playerInfo.userName;
        room.game.currentPlayer = nextPlayerName;
        this.roomManagerService.updateRoom(roomCode, room);

        return nextPlayerName;
    }

    determineWhichPlayerGoesFirst(roomCode: string): string {
        const room = this.roomManagerService.getRoom(roomCode);
        if (!room) return;
        const sortedPlayersBySpeed = room.players.sort((a, b) => b.playerInGame.movementSpeed - a.playerInGame.movementSpeed);
        room.players = sortedPlayersBySpeed;
        room.game.currentPlayer = sortedPlayersBySpeed[0].playerInfo.userName;
        this.roomManagerService.updateRoom(roomCode, room);
        return room.game.currentPlayer;
    }
}
