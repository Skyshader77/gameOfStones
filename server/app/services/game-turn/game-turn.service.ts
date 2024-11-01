import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GameTurnService {
    constructor(private logger: Logger) {}

    nextTurn(room: RoomGame): string | null {
        this.prepareForNextTurn(room);

        const initialCurrentPlayerName = room.game.currentPlayer;
        let currentPlayerIndex = room.players.findIndex((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        do {
            currentPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
        } while (
            room.players[currentPlayerIndex].playerInGame.hasAbandonned &&
            room.players[currentPlayerIndex].playerInfo.userName !== initialCurrentPlayerName
        );

        if (initialCurrentPlayerName === room.players[currentPlayerIndex].playerInfo.userName) {
            this.logger.error('All players have abandoned in room ' + room.room.roomCode);
            return null;
        }

        room.game.currentPlayer = room.players[currentPlayerIndex].playerInfo.userName;
        return room.players[currentPlayerIndex].playerInfo.userName;
    }

    isTurnFinished(room: RoomGame): boolean {
        return this.hasNoMoreActions(room) || this.hasEndedLateAction(room);
    }

    private prepareForNextTurn(room: RoomGame) {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = currentPlayer.playerInGame.movementSpeed;
        room.game.actionsLeft = 1;
        room.game.hasPendingAction = false;
    }

    private hasNoMoreActions(room: RoomGame): boolean {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        return room.game.actionsLeft === 0 && currentPlayer.playerInGame.remainingMovement === 0;
    }

    private hasEndedLateAction(room: RoomGame): boolean {
        return room.game.timer.turnCounter === 0 && room.game.hasPendingAction;
    }
}
