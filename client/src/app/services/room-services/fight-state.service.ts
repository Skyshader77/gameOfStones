import { Injectable } from '@angular/core';
import { FightState } from '@app/interfaces/fight-info';
import { INITIAL_EVADE_COUNT } from '@common/constants/fight.constants';
import { PlayerRole } from '@common/enums/player-role.enum';
import { AttackResult, Fight, FightResult } from '@common/interfaces/fight';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlayerListService } from './player-list.service';

@Injectable({
    providedIn: 'root',
})
export class FightStateService {
    currentFight: Fight;
    isFighting: boolean;
    fightState: FightState = FightState.Idle;
    attackResult$: Observable<AttackResult | null>;
    private _attackResult = new BehaviorSubject<AttackResult | null>(null);

    constructor(private playerListService: PlayerListService) {
        this.attackResult$ = this._attackResult.asObservable();
        this.setInitialFight();
    }

    get attackResult(): AttackResult | null {
        return this._attackResult.value;
    }

    set attackResult(value: AttackResult | null) {
        this._attackResult.next(value);
    }

    isAIInFight() {
        return (
            this.currentFight.fighters.filter((fighter) => [PlayerRole.AggressiveAI, PlayerRole.DefensiveAI].includes(fighter.playerInfo.role))
                .length >= 1
        );
    }

    initializeFight(fightOrder: string[]) {
        this.setInitialFight();

        fightOrder.forEach((fighterName) => {
            const fighter = this.playerListService.playerList.find((player) => player.playerInfo.userName === fighterName);
            if (fighter) {
                this.currentFight.fighters.push(fighter);
            }
        });
        this.isFighting = true;
    }

    initializeFightTurn(currentFighter: string) {
        this.currentFight.currentFighter = this.currentFight.fighters.findIndex((fighter) => fighter.playerInfo.userName === currentFighter);
    }

    processAttack(attackResult: AttackResult) {
        this.attackResult = attackResult;
        if (this.attackResult.hasDealtDamage) {
            this.currentFight.fighters[(this.currentFight.currentFighter + 1) % 2].playerInGame.remainingHp--;
            if (attackResult.wasWinningBlow) {
                this.currentFight.isFinished = true;
            }
        }
    }

    processEvasion(evasionSuccessful: boolean) {
        this.attackResult = null;
        this.currentFight.numbEvasionsLeft[this.currentFight.currentFighter]--;
        if (evasionSuccessful) {
            this.currentFight.fighters.forEach((fighter) => {
                fighter.playerInGame.remainingHp = fighter.playerInGame.attributes.hp;
            });
            this.currentFight.isFinished = true;
        }
    }

    processEndFight(result: FightResult) {
        this.currentFight.result = result;
        const winner = this.currentFight.fighters.find((fighter) => fighter.playerInfo.userName === result.winner);
        const loser = this.currentFight.fighters.find((fighter) => fighter.playerInfo.userName === result.loser);
        if (winner) {
            winner.playerInGame.winCount++;
            winner.playerInGame.remainingHp = winner.playerInGame.attributes.hp;
        }
        if (loser) {
            loser.playerInGame.currentPosition = { x: result.respawnPosition.x, y: result.respawnPosition.y };
            loser.playerInGame.remainingHp = loser.playerInGame.attributes.hp;
        }
        this.setInitialFight();
    }

    evasionsLeft(fighterName: string) {
        const playerIndex = this.currentFight.fighters.findIndex((fighter) => fighter.playerInfo.userName === fighterName);
        if (playerIndex >= 0) {
            return this.currentFight.numbEvasionsLeft[playerIndex];
        }
        return 0;
    }

    setInitialFight() {
        this.currentFight = {
            fighters: [],
            result: {
                winner: null,
                loser: null,
                respawnPosition: { x: 0, y: 0 },
            },
            currentFighter: 0,
            numbEvasionsLeft: [INITIAL_EVADE_COUNT, INITIAL_EVADE_COUNT],
            isFinished: false,
        };

        this.attackResult = null;
        this.isFighting = false;
    }
}
