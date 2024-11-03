import { Injectable } from '@angular/core';
import { AvatarChoice } from '@app/constants/player.constants';
import { Player } from '@app/interfaces/player';
import { PlayerRole } from '@common/constants/player.constants';

@Injectable({
    providedIn: 'root',
})
export class MyPlayerService {
    myPlayer: Player;

    isOrganizer(): boolean {
        return this.myPlayer?.playerInfo.role === PlayerRole.ORGANIZER;
    }

    getUserName(): string {
        return this.myPlayer?.playerInfo.userName;
    }

    getAvatar(): AvatarChoice {
        return this.myPlayer?.playerInfo.avatar;
    }

    getRemainingHp(): number {
        return this.myPlayer?.playerInGame.hp;
    }

    /*  getMaxHp(): number {
        return this.myPlayer?.playerInGame.hp;
    } */

    getMovementSpeed(): number {
        return this.myPlayer?.playerInGame.movementSpeed;
    }

    getAttack(): number {
        return this.myPlayer?.playerInGame.attack;
    }

    getDefense(): number {
        return this.myPlayer?.playerInGame.defense;
    }

    // marche pas pour afficher attackValue et defenseValue
    /*  getD6(): { attackValue: number; defenseValue: number } | undefined {
        if (this.myPlayer?.playerInGame.dice === D6_ATTACK_FIELDS) {
            return {
                attackValue: D6_ATTACK_FIELDS.attackDieValue,
                defenseValue: D6_ATTACK_FIELDS.defenseDieValue,
            };
        } else if (this.myPlayer?.playerInGame.dice === D6_DEFENCE_FIELDS) {
            return {
                attackValue: D6_DEFENCE_FIELDS.attackDieValue,
                defenseValue: D6_DEFENCE_FIELDS.defenseDieValue,
            };
        }
        return undefined;
    } */

    // à retirer juste pour voir que ça
    getD6(): number {
        return 99;
    }

    getRemainingMovement(): number {
        return this.myPlayer?.playerInGame.remainingMovement;
    }

    /* getNumberOfActions(): number {
        return this.myPlayer?.playerInGame.numberOfActions;
    } */
}
