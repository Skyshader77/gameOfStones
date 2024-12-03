import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiceComponent } from '@app/components/dice/dice/dice.component';
import { FightState } from '@app/interfaces/fight-info';
import { FightSocketService } from '@app/services/communication-services/fight-socket/fight-socket.service';
import { GameLoopService } from '@app/services/game-loop/game-loop.service';
import { FightRenderingService } from '@app/services/rendering-services/fight-rendering/fight-rendering.service';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { of } from 'rxjs';
import { FightComponent } from './fight.component';

describe('FightComponent', () => {
    let component: FightComponent;
    let fixture: ComponentFixture<FightComponent>;

    let fightRenderingServiceSpy: jasmine.SpyObj<FightRenderingService>;
    let gameLoopServiceSpy: jasmine.SpyObj<GameLoopService>;
    let fightSocketServiceSpy: jasmine.SpyObj<FightSocketService>;
    let myPlayerServiceSpy: jasmine.SpyObj<MyPlayerService>;
    let fightStateServiceSpy: jasmine.SpyObj<FightStateService>;
    let cdrSpy: jasmine.SpyObj<ChangeDetectorRef>;

    beforeEach(async () => {
        fightRenderingServiceSpy = jasmine.createSpyObj('FightRenderingService', ['setContext', 'setPlayers', 'renderInitialFight']);
        gameLoopServiceSpy = jasmine.createSpyObj('GameLoopService', ['startGameLoop', 'stopGameLoop']);
        fightSocketServiceSpy = jasmine.createSpyObj('FightSocketService', ['sendDesiredAttack', 'sendDesiredEvade']);
        myPlayerServiceSpy = jasmine.createSpyObj('MyPlayerService', ['isCurrentFighter', 'getUserName']);
        fightStateServiceSpy = jasmine.createSpyObj('FightStateService', ['attackResult$', 'fightState', 'evasionsLeft']);
        cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

        fightStateServiceSpy.attackResult$ = of({
            attackRoll: 6,
            defenseRoll: 5,
            hasDealtDamage: true,
            wasWinningBlow: false,
        });

        await TestBed.configureTestingModule({
            imports: [FightComponent, DiceComponent],
            providers: [
                { provide: FightRenderingService, useValue: fightRenderingServiceSpy },
                { provide: GameLoopService, useValue: gameLoopServiceSpy },
                { provide: FightSocketService, useValue: fightSocketServiceSpy },
                { provide: MyPlayerService, useValue: myPlayerServiceSpy },
                { provide: FightStateService, useValue: fightStateServiceSpy },
                { provide: ChangeDetectorRef, useValue: cdrSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(FightComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call handleUpdateRolls on ngOnInit', () => {
        spyOn(component, 'handleUpdateRolls');
        component.ngOnInit();
        expect(component.handleUpdateRolls).toHaveBeenCalled();
    });

    it('should set context and call render functions on ngAfterViewInit', () => {
        const canvasMock = { getContext: jasmine.createSpy().and.returnValue({}) };
        component.canvasElement = { nativeElement: canvasMock } as any;

        component.ngAfterViewInit();
        expect(fightRenderingServiceSpy.setContext).toHaveBeenCalled();
        expect(fightRenderingServiceSpy.setPlayers).toHaveBeenCalled();
        expect(fightRenderingServiceSpy.renderInitialFight).toHaveBeenCalled();
        expect(gameLoopServiceSpy.startGameLoop).toHaveBeenCalled();
    });

    it('should start attack when startAttack is called and fightState is Idle and no dice rolling', () => {
        component['myPlayerService'].isCurrentFighter = true;
        component.diceCompMyPlayer = { isRolling: false } as any;
        fightStateServiceSpy.fightState = FightState.Idle;

        component.startAttack();
        expect(fightSocketServiceSpy.sendDesiredAttack).toHaveBeenCalled();
    });

    it('should not start attack if fightState is not Idle or dice is rolling', () => {
        component['myPlayerService'].isCurrentFighter = true;
        component.diceCompMyPlayer = { isRolling: true } as any;
        fightStateServiceSpy.fightState = FightState.Start;

        component.startAttack();
        expect(fightSocketServiceSpy.sendDesiredAttack).not.toHaveBeenCalled();
    });

    it('should call sendDesiredEvade if conditions are met', () => {
        fightStateServiceSpy.fightState = FightState.Idle;
        component.diceCompMyPlayer = { isRolling: false } as any;

        component.startEvade();
        expect(fightSocketServiceSpy.sendDesiredEvade).toHaveBeenCalled();
    });

    it('should not call sendDesiredEvade if dice is rolling', () => {
        component.diceCompMyPlayer = { isRolling: true } as any;

        component.startEvade();
        expect(fightSocketServiceSpy.sendDesiredEvade).not.toHaveBeenCalled();
    });

    it('should disable evade button if player is not the current fighter or evasions are 0', () => {
        myPlayerServiceSpy.isCurrentFighter = false;
        fightStateServiceSpy.evasionsLeft.and.returnValue(0);

        expect(component.isEvadeDisabled).toBeTrue();
    });

    it('should enable evade button if player is the current fighter and evasions left', () => {
        myPlayerServiceSpy.isCurrentFighter = true;
        fightStateServiceSpy.evasionsLeft.and.returnValue(1);

        expect(component.isEvadeDisabled).toBeFalse();
    });

    it('should not render buttons when fightState is Evade', () => {
        fightStateServiceSpy.fightState = FightState.Evade;
        expect(component.areButtonsRendered()).toBeFalse();
    });

    it('should render buttons when fightState is not Evade', () => {
        fightStateServiceSpy.fightState = FightState.Attack;
        expect(component.areButtonsRendered()).toBeTrue();
    });

    it('should return true for isMyPlayerAttacking when current fighter is the player', () => {
        myPlayerServiceSpy.isCurrentFighter = true;
        expect(component.isMyPlayerAttacking()).toBeTrue();
    });

    it('should return false for isMyPlayerAttacking when current fighter is not the player', () => {
        myPlayerServiceSpy.isCurrentFighter = false;
        expect(component.isMyPlayerAttacking()).toBeFalse();
    });

    it('should call the destroy$ subject on ngOnDestroy to stop game loop', () => {
        spyOn(component['destroy$'], 'next');
        spyOn(component['destroy$'], 'complete');
        component.ngOnDestroy();
        expect(component['destroy$'].next).toHaveBeenCalled();
        expect(component['destroy$'].complete).toHaveBeenCalled();
        expect(gameLoopServiceSpy.stopGameLoop).toHaveBeenCalled();
    });

    it('should handle attack and defense rolls when myPlayerService is not the current fighter (else block)', () => {
        myPlayerServiceSpy.isCurrentFighter = false;

        component.diceCompMyPlayer = { rollDice: jasmine.createSpy('rollDice') } as any;
        component.diceCompOpponent = { rollDice: jasmine.createSpy('rollDice') } as any;

        component.handleUpdateRolls();

        expect(component.myPlayerRoll).toBe(5);
        expect(component.opponentRoll).toBe(6);

        expect(component.diceCompMyPlayer.rollDice).toHaveBeenCalledWith(5);
        expect(component.diceCompOpponent.rollDice).toHaveBeenCalledWith(6);
    });
});
