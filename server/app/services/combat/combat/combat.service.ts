import { AttackResult, ESCAPE_PROBABILITY, Game } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { Fight } from '@common/interfaces/fight';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CombatService {
    fight: Fight;
    game: Game;
    playerOne: Player;
    playerTwo: Player;
    hasFightEnded: boolean;
    // initializeCombat(newFight: Fight, game: Game) {
    //     this.fight = newFight;
    //     this.game = game;
    //     this.playerOne = this.game.players.find((player) => player.id === this.fight.playerIds[0]);
    //     this.playerTwo = this.game.players.find((player) => player.id === this.fight.playerIds[1]);
    //     this.hasFightEnded = false;
    // }

    //TODO: Find a way to incorporate the timer into this

    // determineWhoGoesFirst(): string {
    //     if (this.playerOne.playerInGame.movementSpeed > this.playerTwo.playerInGame.movementSpeed) {
    //         return this.playerOne.id;
    //     } else if (this.playerOne.playerInGame.movementSpeed === this.playerTwo.playerInGame.movementSpeed) {
    //         if (this.playerOne.id === this.game.currentPlayer) {
    //             return this.playerOne.id;
    //         } else {
    //             return this.playerTwo.id;
    //         }
    //     } else {
    //         return this.playerTwo.id;
    //     }
    // }

    // performAttack(attackingPlayerId: string): AttackResult {
    //     const attacker = this.playerOne.id === attackingPlayerId ? this.playerOne : this.playerTwo;
    //     const defender = this.playerOne.id === attackingPlayerId ? this.playerTwo : this.playerOne;

    //     if (
    //         this.WasHpLost(
    //             attacker.playerInGame.attack,
    //             attacker.playerInGame.dice.attackDieValue,
    //             defender.playerInGame.attack,
    //             defender.playerInGame.dice.defenseDieValue,
    //         )
    //     ) {
    //         defender.playerInGame.hp--;
    //     }

    //     if (defender.playerInGame.hp === 0) {
    //         this.hasFightEnded = true;
    //     }
    //     return { playerId: defender.id, remainingHp: defender.playerInGame.hp, hasFightEnded: this.hasFightEnded };
    // }

    // swapPlayerTurn(): string {
    //     let tempPlayer = this.playerOne;
    //     this.playerOne = this.playerTwo;
    //     this.playerTwo = tempPlayer;
    //     return this.playerOne.id;
    // }

    // WasHpLost(attackingPlayerAttribute: number, attackDice: number, defendingPlayerAttribute: number, defendDice: number): boolean {
    //     let AttackDiceRoll = Math.floor(Math.random() * attackDice) + 1;
    //     let DefendDiceRoll = Math.floor(Math.random() * defendDice) + 1;

    //     return attackingPlayerAttribute + AttackDiceRoll - (defendingPlayerAttribute + DefendDiceRoll) > 0;
    // }

    // hasPerformedEscape(escapingPlayerId: string): boolean {
    //     let playerIndex = this.fight.playerIds.find((playerId) => playerId === escapingPlayerId);
    //     if (this.hasPlayerEscaped() && this.fight.numbEvasionsLeft[playerIndex] > 0) {
    //         this.hasFightEnded = true;
    //         return true;
    //     }

    //     if (this.fight.numbEvasionsLeft[playerIndex] > 0) {
    //         this.fight.numbEvasionsLeft[playerIndex]--;
    //     }

    //     return false;
    // }

    hasPlayerEscaped(): boolean {
        return Math.random() <= ESCAPE_PROBABILITY;
    }
}
