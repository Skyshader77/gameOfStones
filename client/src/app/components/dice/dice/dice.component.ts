import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DICE_ROLL_TIME } from '@app/constants/fight-rendering.constants';

@Component({
    selector: 'app-dice',
    templateUrl: './dice.component.html',
    styleUrls: ['./dice.component.css'],
    imports: [CommonModule],
    standalone: true,
})
export class DiceComponent {
    @Input() diceNumber: number = 1;
    isRolling: boolean = false;

    rollDice(roll: number) {
        this.isRolling = true;

        setTimeout(() => {
            this.diceNumber = roll;
            this.isRolling = false;
        }, DICE_ROLL_TIME);
    }
}
