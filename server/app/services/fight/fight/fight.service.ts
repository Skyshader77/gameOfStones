import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Injectable } from '@nestjs/common';
import { EVASION_COUNT, EVASION_PROBABILITY } from './fight.service.constants';
import { AttackResult, Fight } from '@common/interfaces/fight';

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
            winner: null,
            numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
            currentFighter:
                currentPlayer.playerInGame.movementSpeed < opponentPlayer.playerInGame.movementSpeed
                    ? opponentPlayer.playerInfo.userName
                    : currentPlayer.playerInfo.userName,
            hasPendingAction: false,
        };

        return true;
    }

    attack(fight: Fight): AttackResult {
        const attacker = fight.fighters.find((player) => player.playerInfo.userName === fight.currentFighter);
        const defender = fight.fighters.find((player) => player.playerInfo.userName !== fight.currentFighter);

        const attackRoll = Math.floor(Math.random() * attacker.playerInGame.dice.attackDieValue) + 1;
        const defenseRoll = Math.floor(Math.random() * defender.playerInGame.dice.defenseDieValue) + 1;

        const attackResult: AttackResult = {
            hasDealtDamage: this.hasPlayerDealtDamage(attacker, defender, [attackRoll, defenseRoll]),
            wasWinningBlow: false,
            attackRoll,
            defenseRoll,
        };

        if (attackResult.hasDealtDamage) {
            defender.playerInGame.remainingHp--;
            if (defender.playerInGame.remainingHp === 0) {
                fight.winner = attacker;
                attackResult.wasWinningBlow = true;
            }
        }

        return attackResult;
    }

    evade(fight: Fight): boolean {
        const evaderIndex = fight.fighters.findIndex((player) => player.playerInfo.userName === fight.currentFighter);

        let evaded = false;

        if (fight.numbEvasionsLeft[evaderIndex] === 0) return evaded;

        if (this.hasPlayerEvaded()) {
            evaded = true;
        } else {
            fight.numbEvasionsLeft[evaderIndex]--;
            evaded = false;
        }
        return evaded;
    }

    private hasPlayerDealtDamage(attacker: Player, defender: Player, rolls: number[]): boolean {
        return attacker.playerInGame.attack + rolls[0] - (defender.playerInGame.defense + rolls[1]) > 0;
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
