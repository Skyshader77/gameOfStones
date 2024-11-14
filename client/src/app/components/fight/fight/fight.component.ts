import { CommonModule } from '@angular/common';
import { Component, ElementRef, AfterViewInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { DiceComponent } from '@app/components/dice/dice/dice.component';
import { DICE_ROLL_TIME } from '@app/constants/fight-rendering.constants';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { FightState } from '@app/interfaces/fight-info';
import { GameLoopService } from '@app/services/game-loop/game-loop.service';
import { FightRenderingService } from '@app/services/rendering-services/fight-rendering.service';

@Component({
    selector: 'app-fight',
    standalone: true,
    templateUrl: './fight.component.html',
    imports: [DiceComponent, CommonModule],
})
export class FightComponent implements AfterViewInit {
    @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('diceCompMyPlayer') diceCompMyPlayer: DiceComponent;
    @ViewChild('diceCompOpponent') diceCompOpponent: DiceComponent;

    rasterSize = MAP_PIXEL_DIMENSION;
    private fightRenderer = inject(FightRenderingService);
    private gameLoopService = inject(GameLoopService);
    private cdr = inject(ChangeDetectorRef);

    ngAfterViewInit(): void {
        const canvas = this.canvasElement.nativeElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.fightRenderer.setContext(ctx);
        this.fightRenderer.renderInitialFight();
        this.gameLoopService.startGameLoop();

        this.cdr.detectChanges();
    }

    startAttack() {
        if (this.fightRenderer.fightState !== FightState.Idle || this.diceCompMyPlayer.isRolling) {
            return;
        }
        this.diceCompMyPlayer.rollDice(1);
        this.diceCompOpponent.rollDice(2);
        setTimeout(() => {
            this.fightRenderer.fightState = FightState.Attack;
        }, DICE_ROLL_TIME);
    }

    isFightTransitionDone(): boolean {
        if (this.fightRenderer.fightState === FightState.Evade) {
            return false;
        }
        return this.fightRenderer.fightState !== FightState.Start;
    }

    startEvade() {
        if (this.fightRenderer.fightState !== FightState.Idle || this.diceCompMyPlayer.isRolling) {
            return;
        }
        this.fightRenderer.fightState = FightState.Evade;
    }
}
