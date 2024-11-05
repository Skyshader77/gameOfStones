import { TestBed } from '@angular/core/testing';
import { GameTimerComponent } from './game-timer.component';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { MOCK_PLAYERS } from '@app/constants/tests.constants';
import { WARNING_ALERT, WARNING_COLOR, MEDIUM_ALERT, MEDIUM_COLOR, OK_COLOR } from '@app/constants/timer.constants';

describe('GameTimerComponent', () => {
    let component: GameTimerComponent;
    let gameTimeServiceSpy: jasmine.SpyObj<GameTimeService>;
    let gameSocketServiceSpy: jasmine.SpyObj<GameLogicSocketService>;
    let playerListServiceSpy: jasmine.SpyObj<PlayerListService>;

    beforeEach(() => {
        // Create spies for the services
        gameTimeServiceSpy = jasmine.createSpyObj('GameTimeService', ['getRemainingTime', 'initialize', 'cleanup']);
        gameSocketServiceSpy = jasmine.createSpyObj('GameLogicSocketService', ['isChangingTurn']);
        playerListServiceSpy = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer']);

        // Configure TestBed with our component and mock services
        TestBed.configureTestingModule({
            imports: [GameTimerComponent],
            providers: [
                { provide: GameTimeService, useValue: gameTimeServiceSpy },
                { provide: GameLogicSocketService, useValue: gameSocketServiceSpy },
                { provide: PlayerListService, useValue: playerListServiceSpy },
            ],
        }).compileComponents();

        // Instantiate the component
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
        expect(component.currentTime).toBe(remainingTime);
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
});
