import { TestBed } from '@angular/core/testing';
import { MOCK_REMAINING_TIME } from '@app/constants/tests.constants';
import {
    DISABLED_MESSAGE,
    MEDIUM_ALERT,
    MEDIUM_COLOR,
    MILLI_PER_SECONDS,
    OK_COLOR,
    WARNING_ALERT,
    WARNING_COLOR,
} from '@app/constants/timer.constants';
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
        myPlayerSpy = jasmine.createSpyObj('MyPlayerService', [''], { isFighting: false });
        fightSpy = jasmine.createSpyObj('FightStateService', ['']);

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
        jasmine.clock().install();

        component = TestBed.createComponent(GameTimerComponent).componentInstance;
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should initialize GameTimeService on ngOnInit', () => {
        spyOn(component, 'updateCountdown');
        component.ngOnInit();
        expect(gameTimeServiceSpy.initialize).toHaveBeenCalled();
        expect(component.updateCountdown).toHaveBeenCalled();
    });

    it('should call getRemainingTime in updateCountdown when isFighting is true', () => {
        fightSpy.isFighting = true;
        component.updateCountdown();
        jasmine.clock().tick(MILLI_PER_SECONDS);
        expect(gameTimeServiceSpy.getRemainingTime).toHaveBeenCalled();
    });

    it('should call getRemainingTime in updateCountdown when isFighting is false and isChangingTurn is false', () => {
        fightSpy.isFighting = false;
        gameSocketServiceSpy.isChangingTurn = false;
        component.updateCountdown();
        jasmine.clock().tick(MILLI_PER_SECONDS);
        expect(gameTimeServiceSpy.getRemainingTime).toHaveBeenCalled();
    });

    it('should call getRemainingTime in updateCountdown when isFighting is false and isChangingTurn is true', () => {
        fightSpy.isFighting = false;
        gameSocketServiceSpy.isChangingTurn = true;
        component.updateCountdown();
        jasmine.clock().tick(MILLI_PER_SECONDS);
        expect(gameTimeServiceSpy.getRemainingTime).toHaveBeenCalled();
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

    it('should return DISABLED_MESSAGE if isFighting is true and myPlayerService is not fighting', () => {
        Object.defineProperty(fightSpy, 'isFighting', { get: () => true });
        gameTimeServiceSpy.getRemainingTime.and.returnValue(MOCK_REMAINING_TIME);
        expect(component.currentTime).toBe(DISABLED_MESSAGE);
    });
});
