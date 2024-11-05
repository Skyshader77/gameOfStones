import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries } from '@app/common/utilities';
import { RoomGame } from '@app/interfaces/room-game';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { directionToVec2Map } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GameTurnService {
    constructor(private logger: Logger) {}

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
        return this.hasNoMoreActions(room) || this.hasEndedLateAction(room) || this.hasLostFight(room);
    }

    private isNextToActionTile(room: RoomGame): boolean {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        if (!currentPlayer) return false;

        return this.getAdjacentPositions(currentPlayer.playerInGame.currentPosition)
            .filter((pos) => isCoordinateWithinBoundaries(pos, room.game.map.mapArray))
            .some((pos) => this.isActionTile(pos, room));
    }

    private getAdjacentPositions(position: Vec2): Vec2[] {
        return Object.values(directionToVec2Map).map((delta) => ({
            x: position.x + delta.x,
            y: position.y + delta.y,
        }));
    }

    private isActionTile(position: Vec2, room: RoomGame): boolean {
        const tile = room.game.map.mapArray[position.y][position.x];
        return tile === TileTerrain.ClosedDoor || tile === TileTerrain.OpenDoor || isAnotherPlayerPresentOnTile(position, room.players);
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
        return (
            currentPlayer.playerInGame.remainingMovement === 0 &&
            (!this.isNextToActionTile(room) || currentPlayer.playerInGame.remainingActions === 0)
        );
    }

    private hasEndedLateAction(room: RoomGame): boolean {
        return room.game.timer.counter === 0 && room.game.hasPendingAction;
    }

    private hasLostFight(room: RoomGame): boolean {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        if (!room.game.fight) {
            return false;
        } else {
            return currentPlayer.playerInfo.userName === room.game.fight.result.loser;
        }
    }
}
