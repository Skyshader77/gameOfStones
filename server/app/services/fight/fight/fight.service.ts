import { RoomGame } from '@app/interfaces/room-game';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Injectable } from '@nestjs/common';
import { EVASION_COUNT, EVASION_PROBABILITY } from './fight.service.constants';
import { AttackResult } from '@common/interfaces/fight';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { Player } from '@app/interfaces/player';
import { Fight } from '@app/interfaces/gameplay';

@Injectable()
export class FightService {
    constructor(
        private roomManagerService: RoomManagerService,
        private gameTimeService: GameTimeService,
    ) {}

    isFightValid(room: RoomGame, opponentName: string): boolean {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const opponentPlayer = room.players.find((player) => player.playerInfo.userName === opponentName);

        if (!opponentPlayer) {
            return false;
        }

        return this.areFightersAvailable(currentPlayer, opponentPlayer) && this.areFightersClose(currentPlayer, opponentPlayer);
    }

    initializeFight(room: RoomGame, opponentName: string): void {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const opponentPlayer = room.players.find((player) => player.playerInfo.userName === opponentName);

        const fighters = [currentPlayer, opponentPlayer];
        fighters.sort((fighterA, fighterB) => fighterB.playerInGame.attributes.speed - fighterA.playerInGame.attributes.speed);

        room.game.fight = {
            fighters,
            winner: null,
            loser: null,
            numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
            currentFighter: 1,
            hasPendingAction: false,
            timer: this.gameTimeService.getInitialTimer(),
        };
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
                fight.winner = attacker.playerInfo.userName;
                fight.loser = defender.playerInfo.userName;
                attacker.playerInGame.winCount++;
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
        return attacker.playerInGame.attributes.attack + rolls[0] - (defender.playerInGame.attributes.defense + rolls[1]) > 0;
    }

    private hasPlayerEvaded(): boolean {
        return Math.random() < EVASION_PROBABILITY;
    }

    private areFightersAvailable(fighter: Player, opponent: Player) {
        return !fighter.playerInGame.hasAbandoned && !opponent.playerInGame.hasAbandoned;
    }

    private areFightersClose(fighter: Player, opponent: Player): boolean {
        return (
            Math.abs(fighter.playerInGame.currentPosition.x - opponent.playerInGame.currentPosition.x) <= 1 &&
            Math.abs(fighter.playerInGame.currentPosition.y - opponent.playerInGame.currentPosition.y) <= 1
        );
    }

    // isFightTurnFinished(fight: Fight) {
    //     return fight.timer.turnCounter === 0 && fight.hasPendingAction;
    // }
}
