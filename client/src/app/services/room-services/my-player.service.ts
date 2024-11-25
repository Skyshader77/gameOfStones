import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { Avatar } from '@common/enums/avatar.enum';
import { DiceType } from '@common/enums/dice.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { ATTACK_DICE } from '@common/interfaces/dice';

@Injectable({
    providedIn: 'root',
})
export class MyPlayerService {
    myPlayer: Player;
    role: PlayerRole;
    isCurrentPlayer: boolean;
    isCurrentFighter: boolean;
    isFighting: boolean;

    constructor() {
        this.initialize();
    }

    initialize() {
        // this.myPlayer = MOCK_PLAYERS[0];
        this.role = PlayerRole.Human;
        this.isCurrentPlayer = false;
        this.isCurrentFighter = false;
        this.isFighting = false;
    }

    isOrganizer(): boolean {
        return this.role === PlayerRole.Organizer;
    }

    getPlayerId(): string {
        return this.myPlayer?.playerInfo.id;
    }

    getUserName(): string {
        return this.myPlayer?.playerInfo.userName;
    }

    getAvatar(): Avatar {
        return this.myPlayer?.playerInfo.avatar;
    }

    getRemainingHp(): number {
        return this.myPlayer?.playerInGame.remainingHp;
    }

    getMaxHp(): number {
        return this.myPlayer?.playerInGame.attributes.hp;
    }

    getSpeed(): number {
        return this.myPlayer?.playerInGame.attributes.speed;
    }

    getAttack(): number {
        return this.myPlayer?.playerInGame.attributes.attack;
    }

    getDefense(): number {
        return this.myPlayer?.playerInGame.attributes.defense;
    }

    getDice(): DiceType[] {
        if (this.myPlayer.playerInGame.dice === ATTACK_DICE) {
            return [DiceType.Six, DiceType.Four];
        } else {
            return [DiceType.Four, DiceType.Six];
        }
    }

    getRemainingMovement(): number {
        return this.myPlayer?.playerInGame.remainingMovement;
    }

    getRemainingActions(): number {
        return this.myPlayer?.playerInGame.remainingActions;
    }

    getInventory(): ItemType[] {
        return this.myPlayer?.playerInGame.inventory;
    }

    setInventory(inventory: ItemType[]) {
        this.myPlayer.playerInGame.inventory = JSON.parse(JSON.stringify(inventory));
    }
}
