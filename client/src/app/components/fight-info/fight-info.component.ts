import { Component } from '@angular/core';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { PlayerFightInfo, DiceRoll } from '@app/interfaces/fight-info';

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
            info.push(
                { fighterName: fight.fighters[0].playerInfo.userName, evasions: fight.numbEvasionsLeft[0] },
                { fighterName: fight.fighters[1].playerInfo.userName, evasions: fight.numbEvasionsLeft[1] },
            );
        }

        return info;
    }

    get diceRolls(): DiceRoll[] {
        const rolls: DiceRoll[] = [];

        if (this.fightStateService.attackResult) {
            rolls.push({ fighterRole: 'attaquant ', roll: this.fightStateService.attackResult.attackRoll });
            rolls.push({ fighterRole: 'defenseur ', roll: this.fightStateService.attackResult.defenseRoll });
        }

        return rolls;
    }
}
