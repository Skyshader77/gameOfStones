import { TimerDuration } from '@app/constants/time.constants';
import { Fight } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { findNearestValidPosition } from '@app/utils/utilities';
import { AttackResult } from '@common/interfaces/fight';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { EVASION_COUNT, EVASION_PROBABILITY } from './fight.service.constants';

@Injectable()
export class FightLogicService {
    constructor(
        private roomManagerService: RoomManagerService,
        private gameTimeService: GameTimeService,
        private gameStatsService: GameStatsService,
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
                respawnPosition: { x: 0, y: 0 },
            },
            isFinished: false,
            numbEvasionsLeft: [EVASION_COUNT, EVASION_COUNT],
            currentFighter: 1,
            hasPendingAction: false,
            timer: this.gameTimeService.getInitialTimer(),
        };

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

        let attackRoll: number;
        let defenseRoll: number;
        if (room.game.isDebugMode) {
            attackRoll = attacker.playerInGame.dice.attackDieValue;
            defenseRoll = 1;
        } else {
            attackRoll = Math.floor(Math.random() * attacker.playerInGame.dice.attackDieValue) + 1;
            defenseRoll = Math.floor(Math.random() * defender.playerInGame.dice.defenseDieValue) + 1;
        }

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
            this.gameStatsService.processAttackDamageStats(room.game.stats, attacker, defender);
            defender.playerInGame.remainingHp--;
            if (defender.playerInGame.remainingHp === 0) {
                fight.result.winner = attacker.playerInfo.userName;
                fight.result.loser = defender.playerInfo.userName;
                attacker.playerInGame.winCount++;
                attackResult.wasWinningBlow = true;
                fight.isFinished = true;
                const respawnPosition = this.setDefeatedPosition(defender.playerInGame.startPosition, room, defender.playerInfo.userName);
                fight.result.respawnPosition = respawnPosition;
            }
        }

        return attackResult;
    }

    escape(room: RoomGame): boolean {
        const fight = room.game.fight;
        let hasEscaped = false;
        if (fight.numbEvasionsLeft[fight.currentFighter] === 0) return hasEscaped;

        if (this.hasPlayerEscaped()) {
            this.gameStatsService.processSuccessfulEvadeStats(room.game.stats, fight.fighters[fight.currentFighter]);
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

    private setDefeatedPosition(startPosition: Vec2, room: RoomGame, defenderName: string) {
        if (this.isPlayerOtherThanCurrentDefenderPresentOnTile(startPosition, room.players, defenderName)) {
            const freeTilePosition = findNearestValidPosition({
                room,
                startPosition,
                checkForItems: false,
            });
            return freeTilePosition;
        } else {
            return startPosition;
        }
    }

    private isPlayerOtherThanCurrentDefenderPresentOnTile(position: Vec2, players: Player[], defenderName: string): boolean {
        return players.some(
            (player) =>
                player.playerInfo.userName !== defenderName &&
                player.playerInGame.currentPosition.x === position.x &&
                player.playerInGame.currentPosition.y === position.y &&
                !player.playerInGame.hasAbandoned,
        );
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
}
