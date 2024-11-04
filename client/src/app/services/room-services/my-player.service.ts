import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { ATTACK_DICE, DEFENSE_DICE } from '@common/interfaces/dice';

@Injectable({
    providedIn: 'root',
})
export class MyPlayerService {
    myPlayer: Player;
    role: PlayerRole;
    isCurrentPlayer: boolean;
    isCurrentFighter: boolean;
    isFighting: boolean;

    isOrganizer(): boolean {
        return this.role === PlayerRole.Organizer;
    }

    /* isCurrentPlayer(): boolean {
        return this.myPlayer?.playerInGame.isCurrentPlayer === true;
    } */

    getUserName(): string {
        return this.myPlayer?.playerInfo.userName;
    }

    getAvatar(): Avatar {
        return this.myPlayer?.playerInfo.avatar;
    }

    getRemainingHp(): number {
        return this.myPlayer?.playerInGame.attributes.hp;
    }

    /*  getMaxHp(): number {
        return this.myPlayer?.playerInGame.hp;
    } */

    getSpeed(): number {
        return this.myPlayer?.playerInGame.attributes.speed;
    }

    getAttack(): number {
        return this.myPlayer?.playerInGame.attributes.attack;
    }

    getDefense(): number {
        return this.myPlayer?.playerInGame.attributes.defense;
    }

    // marche pas pour afficher attackValue et defenseValue
    getD6(): { attackValue: number; defenseValue: number } | undefined {
        if (this.myPlayer?.playerInGame.dice === ATTACK_DICE) {
            return {
                attackValue: ATTACK_DICE.attackDieValue,
                defenseValue: ATTACK_DICE.defenseDieValue,
            };
        } else if (this.myPlayer?.playerInGame.dice === DEFENSE_DICE) {
            return {
                attackValue: DEFENSE_DICE.attackDieValue,
                defenseValue: DEFENSE_DICE.defenseDieValue,
            };
        }
        return undefined;
    }

    getRemainingMovement(): number {
        return this.myPlayer?.playerInGame.remainingMovement;
    }

    /* getNumberOfActions(): number {
        return this.myPlayer?.playerInGame.numberOfActions;
    } */
}
