import { Component } from '@angular/core';
import { FightStateService } from '@app/services/room-services/fight-state.service';

@Component({
    selector: 'app-fight-info',
    standalone: true,
    imports: [],
    templateUrl: './fight-info.component.html',
    styleUrls: [],
})
export class FightInfoComponent {
    constructor(private fightStateService: FightStateService) {}

    get fightInfo() {
        const info = [];

        // TODO do an interface fightInfoInterfaces
        // playerFightInfo
        // attackDiceRoll
        const fight = this.fightStateService.currentFight;

        if (fight.fighters.length > 0) {
            info.push(
                { name: fight.fighters[0].playerInfo.userName, evasions: fight.numbEvasionsLeft[0] },
                { name: fight.fighters[1].playerInfo.userName, evasions: fight.numbEvasionsLeft[1] },
            );
        }

        return info;
    }

    get diceRolls() {
        const rolls = [];

        if (this.fightStateService.attackResult) {
            rolls.push({ name: 'attackant ', roll: this.fightStateService.attackResult.attackRoll });
            rolls.push({ name: 'defenseur ', roll: this.fightStateService.attackResult.defenseRoll });
        }

        return rolls;
    }
}
