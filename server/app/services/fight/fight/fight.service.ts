import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Injectable } from '@nestjs/common';
import { EVASION_COUNT, EVASION_PROBABILITY } from './fight.service.constants';
import { AttackResult, Fight } from '@common/interfaces/fight';

@Injectable()
export class FightService {
    constructor(private roomManagerService: RoomManagerService) { }

    isFightValid(room: RoomGame, opponentName: string): boolean {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const opponentPlayer = room.players.find((player) => player.playerInfo.userName === opponentName);

        if (!opponentPlayer) {
            return false;
        }

        return this.areFightersAvailable(currentPlayer, opponentPlayer) && this.areFightersClose(currentPlayer, opponentPlayer);
    }

    startFight(room: RoomGame, opponentName: string): string[] {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const opponentPlayer = room.players.find((player) => player.playerInfo.userName === opponentName);

        const fighters = [currentPlayer, opponentPlayer];
        fighters.sort((fighterA, fighterB) => fighterA.playerInGame.movementSpeed - fighterB.playerInGame.movementSpeed);

        room.game.fight = {
            fighters,
            winner: null,
            numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
            currentFighter: 1,
            hasPendingAction: false,
        };

        return fighters.map<string>((fighter) => fighter.playerInfo.userName);
    }

    attack(fight: Fight): AttackResult {
        const attacker = fight.fighters[fight.currentFighter];
        const defender = fight.fighters[(fight.currentFighter + 1) % fight.fighters.length];

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
        let hasEvaded = false;

        if (fight.numbEvasionsLeft[fight.currentFighter] === 0) return hasEvaded;

        if (this.hasPlayerEvaded()) {
            hasEvaded = true;
        } else {
            fight.numbEvasionsLeft[fight.currentFighter]--;
            hasEvaded = false;
        }
        return hasEvaded;
    }

    nextFightTurn(fight: Fight): string {
        fight.currentFighter = (fight.currentFighter + 1) % fight.fighters.length;
        return fight.fighters[fight.currentFighter].playerInfo.userName;
    }

    private hasPlayerDealtDamage(attacker: Player, defender: Player, rolls: number[]): boolean {
        return attacker.playerInGame.attack + rolls[0] - (defender.playerInGame.defense + rolls[1]) > 0;
    }

    private hasPlayerEvaded(): boolean {
        return Math.random() < EVASION_PROBABILITY;
    }

    private areFightersAvailable(fighter: Player, opponent: Player) {
        return !fighter.playerInGame.hasAbandonned && !opponent.playerInGame.hasAbandonned;
    }

    private areFightersClose(fighter: Player, opponent: Player): boolean {
        return (
            Math.abs(fighter.playerInGame.currentPosition.x - opponent.playerInGame.currentPosition.x) <= 1 &&
            Math.abs(fighter.playerInGame.currentPosition.y - opponent.playerInGame.currentPosition.y) <= 1
        );
    }
}
