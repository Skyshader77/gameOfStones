import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DICE_ROLL_TIME, START_DICE_NUMBER } from '@app/constants/fight-rendering.constants';

@Component({
    selector: 'app-dice',
    templateUrl: './dice.component.html',
    styleUrls: ['./dice.component.css'],
    imports: [CommonModule],
    standalone: true,
})
export class DiceComponent {
    @Input() diceNumber: number = START_DICE_NUMBER;
    isRolling: boolean = false;

    rollDice(roll: number) {
        this.isRolling = true;
        this.diceNumber = roll;
        setTimeout(() => {
            this.isRolling = false;
        }, DICE_ROLL_TIME);
    }
}
