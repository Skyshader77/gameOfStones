import { Injectable } from '@angular/core';
import { AttackResult, Fight, FightResult } from '@common/interfaces/fight';
import { PlayerListService } from './player-list.service';

@Injectable({
    providedIn: 'root',
})
export class FightStateService {
    currentFight: Fight;
    attackRoll: number;
    defenseRoll: number;

    constructor(private playerListService: PlayerListService) {
        this.setInitialFight();
    }

    initializeFight(fightOrder: string[]) {
        this.setInitialFight();

        fightOrder.forEach((fighterName) => {
            const fighter = this.playerListService.playerList.find((player) => player.playerInfo.userName === fighterName);
            if (fighter) {
                this.currentFight.fighters.push(fighter);
            }
        });
    }

    initializeFightTurn(currentFighter: string) {
        this.currentFight.currentFighter = this.currentFight.fighters.findIndex((fighter) => fighter.playerInfo.userName === currentFighter);
    }

    processAttack(attackResult: AttackResult) {
        this.attackRoll = attackResult.attackRoll;
        this.defenseRoll = attackResult.defenseRoll;
        if (attackResult.hasDealtDamage) {
            this.currentFight.fighters[(this.currentFight.currentFighter + 1) % 2].playerInGame.remainingHp--;
            if (attackResult.wasWinningBlow) {
                this.currentFight.isFinished = true;
            }
        }
    }

    processEvasion(evasionSuccessful: boolean) {
        this.currentFight.numbEvasionsLeft[this.currentFight.currentFighter]--;
        if (evasionSuccessful) {
            this.currentFight.isFinished = true;
        }
    }

    processEndFight(result: FightResult) {
        this.currentFight.result = result;
        const winner = this.currentFight.fighters.find((fighter) => fighter.playerInfo.userName === result.winner);
        const loser = this.currentFight.fighters.find((fighter) => fighter.playerInfo.userName === result.loser);
        if (winner) {
            winner.playerInGame.winCount++;
        }
        if (loser) {
            loser.playerInGame.currentPosition = loser.playerInGame.startPosition;
            loser.playerInGame.remainingHp = loser.playerInGame.attributes.hp;
        }
        this.setInitialFight();
    }

    evasionsLeft(fighterName: string) {
        const playerIndex = this.currentFight.fighters.findIndex((fighter) => fighter.playerInfo.userName === fighterName);
        if (playerIndex > 0) {
            return this.currentFight.numbEvasionsLeft[playerIndex];
        }
        return 0;
    }

    private setInitialFight() {
        this.currentFight = {
            fighters: [],
            result: {
                winner: null,
                loser: null,
            },
            currentFighter: 0,
            hasPendingAction: false,
            numbEvasionsLeft: [2, 2],
            isFinished: false,
        };
    }
}
