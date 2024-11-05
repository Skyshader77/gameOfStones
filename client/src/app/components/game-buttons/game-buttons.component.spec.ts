import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { PlayButtonsService } from '@app/services/play-buttons/play-buttons.service';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameButtonsComponent } from './game-buttons.component';

describe('GameButtonsComponent', () => {
    let component: GameButtonsComponent;
    let fixture: ComponentFixture<GameButtonsComponent>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;
    let fightStateService: jasmine.SpyObj<FightStateService>;
    let gameLogicSocketService: jasmine.SpyObj<GameLogicSocketService>;
    let playButtonLogic: jasmine.SpyObj<PlayButtonsService>;
    let playerListService: jasmine.SpyObj<PlayerListService>;

    beforeEach(async () => {
        myPlayerService = jasmine.createSpyObj('MyPlayerService', ['getUserName'], {});
        fightStateService = jasmine.createSpyObj('FightStateService', ['evasionsLeft']);
        gameLogicSocketService = jasmine.createSpyObj('GameLogicSocketService', ['endTurn']);
        playButtonLogic = jasmine.createSpyObj('PlayButtonsService', ['clickEvadeButton', 'clickAttackButton', 'clickActionButton']);
        playerListService = jasmine.createSpyObj('PlayerListService', ['actionsLeft']);

        await TestBed.configureTestingModule({
            imports: [GameButtonsComponent],
            providers: [
                { provide: MyPlayerService, useValue: myPlayerService },
                { provide: FightStateService, useValue: fightStateService },
                { provide: GameLogicSocketService, useValue: gameLogicSocketService },
                { provide: PlayButtonsService, useValue: playButtonLogic },
                { provide: PlayerListService, useValue: playerListService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return false when isFighting is false', () => {
        myPlayerService.isFighting = false;
        const result = component.isFighting;
        expect(result).toBe(false);
    });

    it('should return true when isFighting is true', () => {
        myPlayerService.isFighting = true;
        const result = component.isFighting;
        expect(result).toBe(true);
    });

    it('should return true if evasionsLeft is greater than 0', () => {
        myPlayerService.getUserName.and.returnValue('player1');
        fightStateService.evasionsLeft.and.returnValue(1);

        const result = component.hasEvasionsLeft;

        expect(result).toBe(true);
    });

    it('should return false if evasionsLeft is 0', () => {
        myPlayerService.getUserName.and.returnValue('player1');
        fightStateService.evasionsLeft.and.returnValue(0);

        const result = component.hasEvasionsLeft;

        expect(result).toBe(false);
    });

    it('should call endTurn on gameLogicSocketService when onFinishTurnClicked is called', () => {
        component.onFinishTurnClicked();

        expect(gameLogicSocketService.endTurn).toHaveBeenCalled();
    });

    it('should emit abandon event when onAbandonGameClicked is called', () => {
        spyOn(component.abandon, 'emit');

        component.onAbandonGameClicked();

        expect(component.abandon.emit).toHaveBeenCalled();
    });

    it('should call clickEvadeButton on playButtonLogic when onEvadeButtonClicked is called', () => {
        component.onEvadeButtonClicked();

        expect(playButtonLogic.clickEvadeButton).toHaveBeenCalled();
    });

    it('should call clickAttackButton on playButtonLogic when onAttackButtonClicked is called', () => {
        component.onAttackButtonClicked();

        expect(playButtonLogic.clickAttackButton).toHaveBeenCalled();
    });

    it('should call clickActionButton on playButtonLogic when onActionButtonClicked is called', () => {
        component.onActionButtonClicked();

        expect(playButtonLogic.clickActionButton).toHaveBeenCalled();
    });

    it('should return true when actionsLeft() returns a value greater than 0', () => {
        playerListService.actionsLeft.and.returnValue(1);
        expect(component.hasActionsLeft).toBeTrue();
    });

    it('should return false when actionsLeft() returns 0', () => {
        playerListService.actionsLeft.and.returnValue(0);
        expect(component.hasActionsLeft).toBeFalse();
    });
});
