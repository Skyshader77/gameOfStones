import { Player } from '@common/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GameTurnService {
    constructor(private logger: Logger) { }

    nextTurn(room: RoomGame): string | null {
        this.prepareForNextTurn(room);

        const nextPlayerName = this.findNextCurrentPlayerName(room);

        if (room.game.currentPlayer === nextPlayerName) {
            this.logger.error('All players have abandoned in room ' + room.room.roomCode);
            return null;
        }

        room.game.currentPlayer = nextPlayerName;
        return nextPlayerName;
    }

    isTurnFinished(room: RoomGame): boolean {
        return this.hasNoMoreActions(room) || this.hasEndedLateAction(room);
    }

    private findNextCurrentPlayerName(room: RoomGame): string {
        const initialCurrentPlayerName = room.game.currentPlayer;
        let nextPlayerIndex = room.players.findIndex((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        do {
            nextPlayerIndex = (nextPlayerIndex + 1) % room.players.length;
        } while (
            room.players[nextPlayerIndex].playerInGame.hasAbandoned &&
            room.players[nextPlayerIndex].playerInfo.userName !== initialCurrentPlayerName
        );

        return room.players[nextPlayerIndex].playerInfo.userName;
    }

    private prepareForNextTurn(room: RoomGame) {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = currentPlayer.playerInGame.attributes.speed;
        currentPlayer.playerInGame.remainingActions = 1;
        room.game.hasPendingAction = false;
    }

    private hasNoMoreActions(room: RoomGame): boolean {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        return currentPlayer.playerInGame.remainingActions === 0 && currentPlayer.playerInGame.remainingMovement === 0;
    }

    private hasEndedLateAction(room: RoomGame): boolean {
        return room.game.timer.counter === 0 && room.game.hasPendingAction;
    }
}
