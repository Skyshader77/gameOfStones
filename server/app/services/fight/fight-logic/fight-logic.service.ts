import { TimerDuration } from '@app/constants/time.constants';
import { Fight } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { AttackResult } from '@common/interfaces/fight';
import { Player } from '@common/interfaces/player';
import { Injectable } from '@nestjs/common';
import { EVASION_COUNT, EVASION_PROBABILITY } from './fight.service.constants';

@Injectable()
export class FightLogicService {
    constructor(
        private roomManagerService: RoomManagerService,
        private gameTimeService: GameTimeService,
        private gameStatsService: GameStatsService,
        private pathfindingService: PathFindingService,
    ) {}

    isRoomInFight(room: RoomGame): boolean {
        return Boolean(room.game.fight);
    }

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

        room.game.fight = this.getInitialFight(fighters);

        currentPlayer.playerInGame.remainingActions--;
    }

    endFight(room: RoomGame) {
        this.gameStatsService.processFightEndStats(
            room.game.stats,
            room.game.fight.result,
            room.game.fight.fighters.map((fighter) => fighter.playerInfo.userName),
        );
    }

    isCurrentFighter(fight: Fight, fighterName: string): boolean {
        return fight.fighters[fight.currentFighter].playerInfo.userName === fighterName;
    }

    attack(room: RoomGame): AttackResult {
        const fight = room.game.fight;
        const attacker = fight.fighters[fight.currentFighter];
        const defender = fight.fighters[(fight.currentFighter + 1) % fight.fighters.length];

        const [attackRoll, defenseRoll]: number[] = this.rollDice(room, attacker, defender);

        const attackResult: AttackResult = {
            hasDealtDamage: this.hasPlayerDealtDamage(attacker.playerInGame.attributes.attack, defender.playerInGame.attributes.defense, [
                attackRoll,
                defenseRoll,
            ]),
            wasWinningBlow: false,
            attackRoll,
            defenseRoll,
        };

        if (attackResult.hasDealtDamage) {
            this.dealAttackDamage(room, attacker, defender);
            if (room.game.fight.isFinished) {
                attackResult.wasWinningBlow = true;
            }
        }

        return attackResult;
    }

    escape(room: RoomGame): boolean {
        const fight = room.game.fight;
        let hasEscaped = false;
        if (fight.numbEvasionsLeft[fight.currentFighter] === 0) return hasEscaped;

        hasEscaped = this.hasPlayerEscaped();
        this.processEvasion(room, hasEscaped);

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

    setFightResult(room: RoomGame, winner: Player, loser: Player): void {
        const fight = room.game.fight;

        fight.result.winner = winner.playerInfo.userName;
        fight.result.loser = loser.playerInfo.userName;
        fight.isFinished = true;
        fight.result.respawnPosition = this.pathfindingService.getReSpawnPosition(loser,room);
        winner.playerInGame.winCount++;
    }

    private rollDice(room: RoomGame, attacker: Player, defender: Player): number[] {
        let attackRoll: number;
        let defenseRoll: number;
        if (room.game.isDebugMode) {
            attackRoll = attacker.playerInGame.dice.attackDieValue;
            defenseRoll = 1;
        } else {
            attackRoll = this.singleDiceRoll(attacker.playerInGame.dice.attackDieValue);
            defenseRoll = this.singleDiceRoll(defender.playerInGame.dice.defenseDieValue);
        }
        return [attackRoll, defenseRoll];
    }

    private singleDiceRoll(diceSize: number) {
        return Math.floor(Math.random() * diceSize) + 1;
    }

    private dealAttackDamage(room: RoomGame, attacker: Player, defender: Player) {
        this.gameStatsService.processAttackDamageStats(room.game.stats, attacker, defender);
        defender.playerInGame.remainingHp--;
        if (defender.playerInGame.remainingHp === 0) {
            room.game.fight.result.winner = attacker.playerInfo.userName;
            room.game.fight.result.loser = defender.playerInfo.userName;
            this.setFightResult(room, attacker, defender);
        }
    }

    private processEvasion(room: RoomGame, hasEvaded: boolean) {
        const fight = room.game.fight;
        if (hasEvaded) {
            this.gameStatsService.processSuccessfulEvadeStats(room.game.stats, fight.fighters[fight.currentFighter]);
            fight.isFinished = true;
        } else {
            fight.numbEvasionsLeft[fight.currentFighter]--;
        }
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

    private getInitialFight(fighters: Player[]) {
        return {
            fighters,
            result: {
                winner: null,
                loser: null,
                respawnPosition: { x: 0, y: 0 },
            },
            isFinished: false,
            numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
            currentFighter: 1,
            hasPendingAction: false,
            timer: this.gameTimeService.getInitialTimer(),
        };
    }
}
