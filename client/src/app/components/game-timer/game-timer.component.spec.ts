import { TestBed } from '@angular/core/testing';
import { MOCK_PLAYERS, MOCK_REMAINING_TIME } from '@app/constants/tests.constants';
import { DISABLED_MESSAGE, MEDIUM_ALERT, MEDIUM_COLOR, OK_COLOR, WARNING_ALERT, WARNING_COLOR } from '@app/constants/timer.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { GameTimerComponent } from './game-timer.component';

describe('GameTimerComponent', () => {
    let component: GameTimerComponent;
    let gameTimeServiceSpy: jasmine.SpyObj<GameTimeService>;
    let gameSocketServiceSpy: jasmine.SpyObj<GameLogicSocketService>;
    let playerListServiceSpy: jasmine.SpyObj<PlayerListService>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;
    let fightSpy: jasmine.SpyObj<FightStateService>;

    beforeEach(() => {
        gameTimeServiceSpy = jasmine.createSpyObj('GameTimeService', ['getRemainingTime', 'initialize', 'cleanup']);
        gameSocketServiceSpy = jasmine.createSpyObj('GameLogicSocketService', ['isChangingTurn']);
        playerListServiceSpy = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer']);
        myPlayerSpy = jasmine.createSpyObj('MyPlayerService', [], { isFighting: false });
        fightSpy = jasmine.createSpyObj('FightStateService', [], { isFighting: false });

        TestBed.configureTestingModule({
            imports: [GameTimerComponent],
            providers: [
                { provide: GameTimeService, useValue: gameTimeServiceSpy },
                { provide: GameLogicSocketService, useValue: gameSocketServiceSpy },
                { provide: PlayerListService, useValue: playerListServiceSpy },
                { provide: MyPlayerService, useValue: myPlayerSpy },
                { provide: FightStateService, useValue: fightSpy },
            ],
        }).compileComponents();

        component = TestBed.createComponent(GameTimerComponent).componentInstance;
    });

    it('should initialize GameTimeService on ngOnInit', () => {
        component.ngOnInit();
        expect(gameTimeServiceSpy.initialize).toHaveBeenCalled();
    });

    it('should clean up GameTimeService on ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(gameTimeServiceSpy.cleanup).toHaveBeenCalled();
    });

    it('should return remaining time from GameTimeService for currentTime getter', () => {
        const remainingTime = 120;
        gameTimeServiceSpy.getRemainingTime.and.returnValue(remainingTime);
        expect(component.currentTime).toBe('' + remainingTime);
    });

    it('should return WARNING_COLOR if time is less than or equal to WARNING_ALERT', () => {
        gameTimeServiceSpy.getRemainingTime.and.returnValue(WARNING_ALERT);
        expect(component.textColor).toBe(WARNING_COLOR);
    });

    it('should return MEDIUM_COLOR if time is less than or equal to MEDIUM_ALERT and more than WARNING_ALERT', () => {
        gameTimeServiceSpy.getRemainingTime.and.returnValue(MEDIUM_ALERT);
        expect(component.textColor).toBe(MEDIUM_COLOR);
    });

    it('should return OK_COLOR if time is more than MEDIUM_ALERT', () => {
        gameTimeServiceSpy.getRemainingTime.and.returnValue(MEDIUM_ALERT + 1);
        expect(component.textColor).toBe(OK_COLOR);
    });

    it('should return the current player username from PlayerListService for getNextPlayer', () => {
        playerListServiceSpy.getCurrentPlayer.and.returnValue(MOCK_PLAYERS[0]);
        expect(component.getNextPlayer()).toBe(MOCK_PLAYERS[0].playerInfo.userName);
    });

    it('should return undefined if there is no current player in PlayerListService for getNextPlayer', () => {
        playerListServiceSpy.getCurrentPlayer.and.returnValue(undefined);
        expect(component.getNextPlayer()).toBeUndefined();
    });

    it('should return true if GameLogicSocketService is changing turn for canPrintNextPlayer', () => {
        gameSocketServiceSpy.isChangingTurn = true;
        expect(component.canPrintNextPlayer()).toBeTrue();
    });

    it('should return false if GameLogicSocketService is not changing turn for canPrintNextPlayer', () => {
        gameSocketServiceSpy.isChangingTurn = false;
        expect(component.canPrintNextPlayer()).toBeFalse();
    });

    it('should return DISABLED_MESSAGE if isFighting is true and myPlayerService is not fighting', () => {
        Object.defineProperty(fightSpy, 'isFighting', { get: () => true });
        gameTimeServiceSpy.getRemainingTime.and.returnValue(MOCK_REMAINING_TIME);

        expect(component.currentTime).toBe(DISABLED_MESSAGE);
    });
});
