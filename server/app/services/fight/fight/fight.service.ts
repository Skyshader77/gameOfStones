import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Injectable } from '@nestjs/common';
import { EVASION_COUNT, EVASION_PROBABILITY } from './fight.service.constants';

@Injectable()
export class FightService {
    constructor(private roomManagerService: RoomManagerService) {}

    startFight(room: RoomGame, opponentName: string): boolean {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const opponentPlayer = room.players.find((player) => player.playerInfo.userName === opponentName);

        if (this.areFightersUnavailable(currentPlayer, opponentPlayer) || this.areFightersFar(currentPlayer, opponentPlayer)) {
            return false;
        }

        room.game.fight = {
            fighters: [currentPlayer, opponentPlayer],
            numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
            currentFighter:
                currentPlayer.playerInGame.movementSpeed < opponentPlayer.playerInGame.movementSpeed
                    ? opponentPlayer.playerInfo.userName
                    : currentPlayer.playerInfo.userName,
            hasPendingAction: false,
        };

        return true;
    }

    attack(room: RoomGame, attackerName: string) {

    }

    evade(room: RoomGame, evaderName: string) {

    }

    private hasPlayerDealtDamage(): boolean {
        return false;
    }

    private hasPlayerEvaded(): boolean {
        return Math.random() < EVASION_PROBABILITY;
    }

    private areFightersUnavailable(fighter: Player, opponent: Player) {
        return fighter.playerInGame.hasAbandonned || opponent.playerInGame.hasAbandonned;
    }

    private areFightersFar(fighter: Player, opponent: Player): boolean {
        return (
            Math.abs(fighter.playerInGame.currentPosition.x - opponent.playerInGame.currentPosition.x) > 1 ||
            Math.abs(fighter.playerInGame.currentPosition.y - opponent.playerInGame.currentPosition.y) > 1
        );
    }
}
