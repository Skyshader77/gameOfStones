/* eslint-disable @typescript-eslint/no-empty-function */

import { Test, TestingModule } from '@nestjs/testing';
import { GameTimeService } from './game-time.service';
import { GameTimer } from '@app/interfaces/gameplay';
import { INITIAL_TIMER } from '@app/constants/time.constants';
import { Subject } from 'rxjs';

export const MOCK_COUNTER = 5;

describe('GameTimeService', () => {
    let service: GameTimeService;
    let mockTimer: GameTimer;
    beforeEach(async () => {
        jest.useFakeTimers();
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameTimeService],
        }).compile();

        service = module.get<GameTimeService>(GameTimeService);
        mockTimer = service.getInitialTimer();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
        clearInterval(mockTimer.timerId);
    });

    describe('getInitialTimer', () => {
        it('should return an initial timer object', () => {
            const timer = service.getInitialTimer();
            expect(timer).toEqual(INITIAL_TIMER);
        });
    });

    describe('getTimerSubject', () => {
        it('should return an observable of the timer subject', () => {
            const timerSubject = service.getTimerSubject(mockTimer);
            expect(timerSubject).toBeDefined();
        });
    });

    describe('startTimer', () => {
        it('should set the counter and resume the timer', () => {
            const resumeSpy = jest.spyOn(service, 'resumeTimer').mockImplementation(() => {});
            service.startTimer(mockTimer, MOCK_COUNTER);
            expect(mockTimer.counter).toBe(MOCK_COUNTER);
            expect(resumeSpy).toBeCalled();
        });
    });

    describe('resumeTimer', () => {
        it('should resume the timer', () => {
            mockTimer.counter = MOCK_COUNTER;

            const callbackSpy = jest.spyOn(GameTimeService.prototype as any, 'timerCallback').mockImplementation(() => {});

            service.resumeTimer(mockTimer);

            jest.runOnlyPendingTimers();

            expect(mockTimer.timerId).toBeDefined();
            expect(callbackSpy).toHaveBeenCalled();
        });

        it('should stop and rerun the timer', () => {
            const stopSpy = jest.spyOn(service, 'stopTimer').mockImplementation(() => {});
            mockTimer.counter = MOCK_COUNTER;
            mockTimer.timerId = setInterval(() => {});

            service.resumeTimer(mockTimer);

            expect(mockTimer.timerId).toBeDefined();
            expect(stopSpy).toHaveBeenCalled();
        });
    });

    describe('stopTimer', () => {
        it('should clear the timer interval', () => {
            const clearSpy = jest.spyOn(global, 'clearInterval');
            service.stopTimer(mockTimer);

            expect(clearSpy).toBeCalled();
        });
    });

    describe('timerCallback', () => {
        it('should emit when greater than 0', () => {
            const ti = {
                counter: 1,
                timerSubject: new Subject<number>(),
            } as GameTimer;
            const emitSpy = jest.spyOn(ti.timerSubject, 'next');
            service.timerCallback(ti);

            expect(emitSpy).toHaveBeenCalled();
        });

        it('should not emit when 0', () => {
            const emitSpy = jest.spyOn(mockTimer.timerSubject, 'next');
            service['timerCallback'](mockTimer);

            expect(emitSpy).not.toHaveBeenCalled();
        });
    });
});
