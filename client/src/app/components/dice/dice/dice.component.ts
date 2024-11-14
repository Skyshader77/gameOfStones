import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiceService } from '@app/services/dice/dice.service';
import { CommonModule } from '@angular/common';
import { DICE_ROLL_TIME } from '@app/constants/fight-rendering.constants';

@Component({
    selector: 'app-dice',
    templateUrl: './dice.component.html',
    styleUrls: ['./dice.component.css'],
    imports: [CommonModule],
    standalone: true,
})
export class DiceComponent implements OnInit, OnDestroy {
    @Input() diceNumber: number = 1;
    isRolling: boolean = false;
    private diceRollListener: Subscription;

    constructor(private diceService: DiceService) {}

    ngOnInit() {
        this.diceRollListener = this.diceService.rollDice$.subscribe((roll: number) => this.rollDice(roll));
    }

    ngOnDestroy() {
        this.diceRollListener.unsubscribe();
    }

    rollDice(roll: number) {
        this.isRolling = true;

        setTimeout(() => {
            this.diceNumber = roll;
            this.isRolling = false;
        }, DICE_ROLL_TIME);
    }
}
