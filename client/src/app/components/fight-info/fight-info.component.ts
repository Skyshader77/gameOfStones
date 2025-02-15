import { Component } from '@angular/core';
import { PlayerFightInfo, DiceRoll } from '@app/interfaces/fight-info';
import { FIGHTER_ROLE_ATTACKER, FIGHT_ROLE_DEFENDER } from '@app/constants/play.constants';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';

@Component({
    selector: 'app-fight-info',
    standalone: true,
    imports: [],
    templateUrl: './fight-info.component.html',
    styleUrls: [],
})
export class FightInfoComponent {
    constructor(private fightStateService: FightStateService) {}

    get fightInfo(): PlayerFightInfo[] {
        const info: PlayerFightInfo[] = [];

        const fight = this.fightStateService.currentFight;

        if (fight.fighters.length > 0) {
            fight.fighters.forEach((fighter, index: number) => {
                info.push({ fighterName: fighter.playerInfo.userName, evasions: fight.numbEvasionsLeft[index] });
            });
        }

        return info;
    }

    get diceRolls(): DiceRoll[] {
        const rolls: DiceRoll[] = [];

        if (this.fightStateService.attackResult) {
            rolls.push({ fighterRole: FIGHTER_ROLE_ATTACKER, roll: this.fightStateService.attackResult.attackRoll });
            rolls.push({ fighterRole: FIGHT_ROLE_DEFENDER, roll: this.fightStateService.attackResult.defenseRoll });
        }

        return rolls;
    }
}
