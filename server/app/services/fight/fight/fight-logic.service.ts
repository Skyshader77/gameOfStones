import { RoomGame } from '@app/interfaces/room-game';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Injectable } from '@nestjs/common';
import { EVASION_COUNT, EVASION_PROBABILITY } from './fight.service.constants';
import { AttackResult } from '@common/interfaces/fight';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { Player } from '@app/interfaces/player';
import { Fight } from '@app/interfaces/gameplay';
import { TimerDuration } from '@app/constants/time.constants';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ICE_COMBAT_DEBUFF_VALUE as ICE_COMBAT_DE_BUFF_VALUE } from '@app/constants/gameplay.constants';

@Injectable()
export class FightLogicService {
    constructor(
        private roomManagerService: RoomManagerService,
        private gameTimeService: GameTimeService,
    ) {}

    isFightValid(room: RoomGame, opponentName: string): boolean {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const opponentPlayer = room.players.find((player) => player.playerInfo.userName === opponentName);

        if (!opponentPlayer || currentPlayer.playerInGame.remainingActions === 0) {
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
            result: {
                winner: null,
                loser: null,
            },
            isFinished: false,
            numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
            currentFighter: 1,
            hasPendingAction: false,
            timer: this.gameTimeService.getInitialTimer(),
        };

        currentPlayer.playerInGame.remainingActions--;
    }

    isCurrentFighter(fight: Fight, fighterName: string): boolean {
        return fight.fighters[fight.currentFighter].playerInfo.userName === fighterName;
    }

    attack(room: RoomGame): AttackResult {
        const fight = room.game.fight;
        const attacker = fight.fighters[fight.currentFighter];
        const defender = fight.fighters[(fight.currentFighter + 1) % fight.fighters.length];

        const attackRoll = Math.floor(Math.random() * attacker.playerInGame.dice.attackDieValue) + 1;
        const defenseRoll = Math.floor(Math.random() * defender.playerInGame.dice.defenseDieValue) + 1;

        const attackResult: AttackResult = {
            hasDealtDamage: this.hasPlayerDealtDamage(this.getPlayerAttack(attacker, room), this.getPlayerDefense(defender, room), [
                attackRoll,
                defenseRoll,
            ]),
            wasWinningBlow: false,
            attackRoll,
            defenseRoll,
        };

        if (attackResult.hasDealtDamage) {
            defender.playerInGame.remainingHp--;
            if (defender.playerInGame.remainingHp === 0) {
                fight.result.winner = attacker.playerInfo.userName;
                fight.result.loser = defender.playerInfo.userName;
                attacker.playerInGame.winCount++;
                defender.playerInGame.currentPosition = defender.playerInGame.startPosition;
                attackResult.wasWinningBlow = true;
                fight.isFinished = true;
            }
        }

        return attackResult;
    }

    escape(fight: Fight): boolean {
        let hasEscaped = false;
        if (fight.numbEvasionsLeft[fight.currentFighter] === 0) return hasEscaped;

        if (this.hasPlayerEscaped()) {
            hasEscaped = true;
            fight.isFinished = true;
        } else {
            fight.numbEvasionsLeft[fight.currentFighter]--;
            hasEscaped = false;
        }

        fight.hasPendingAction = true;

        return hasEscaped;
    }

    nextFightTurn(fight: Fight): string {
        fight.currentFighter = (fight.currentFighter + 1) % fight.fighters.length;
        return fight.fighters[fight.currentFighter].playerInfo.userName;
    }

    getTurnTime(fight: Fight): TimerDuration {
        return fight.numbEvasionsLeft[fight.currentFighter] > 0 ? TimerDuration.FightTurnEvasion : TimerDuration.FightTurnNoEvasion;
    }

    private hasPlayerDealtDamage(attack: number, defense: number, rolls: number[]): boolean {
        return attack + rolls[0] - (defense + rolls[1]) > 0;
    }

    private hasPlayerEscaped(): boolean {
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

    private getPlayerAttack(fighter: Player, room: RoomGame) {
        return fighter.playerInGame.attributes.attack - this.getDeBuffValue(fighter, room);
    }

    private getPlayerDefense(fighter: Player, room: RoomGame) {
        return fighter.playerInGame.attributes.defense - this.getDeBuffValue(fighter, room);
    }

    private getDeBuffValue(fighter: Player, room: RoomGame): number {
        const x = fighter.playerInGame.currentPosition.x;
        const y = fighter.playerInGame.currentPosition.y;
        const terrain = room.game.map.mapArray[y][x];
        if (terrain === TileTerrain.Ice) {
            return ICE_COMBAT_DE_BUFF_VALUE;
        }
        return 0;
    }
}
