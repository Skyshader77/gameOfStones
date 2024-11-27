import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { PlayButtonsService } from '@app/services/play-buttons/play-buttons.service';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
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
        myPlayerService = jasmine.createSpyObj('MyPlayerService', ['getUserName', 'getRemainingActions'], {});
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

    it('should return false when all conditions are false', () => {
        myPlayerService.isCurrentPlayer = true;
        myPlayerService.isFighting = false;
        myPlayerService.getRemainingActions.and.returnValue(1);
        gameLogicSocketService.isChangingTurn = false;
        const result = component.isActionDisabled;

        expect(result).toBeFalse();
    });

    it('should return false for isEvadeDisabled and isFinishTurnDisabled when conditions are false', () => {
        myPlayerService.isCurrentFighter = true;
        fightStateService.evasionsLeft.and.returnValue(1);
        myPlayerService.isCurrentPlayer = true;
        myPlayerService.isFighting = false;
        gameLogicSocketService.isChangingTurn = false;

        const finishTurnDisabledResult = component.isFinishTurnDisabled;

        expect(finishTurnDisabledResult).toBeFalse();
    });

    it('should be action disabled when isFighting is true', () => {
        myPlayerService.isFighting = true;
        const result = component.isActionDisabled;
        expect(result).toBe(true);
    });

    it('should be finish turn disabled when isFighting is true', () => {
        myPlayerService.isFighting = true;
        const result = component.isFinishTurnDisabled;
        expect(result).toBe(true);
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

    it('should call clickActionButton on playButtonLogic when onActionButtonClicked is called', () => {
        component.onActionButtonClicked();

        expect(playButtonLogic.clickActionButton).toHaveBeenCalled();
    });
});
