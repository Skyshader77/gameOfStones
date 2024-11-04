import { Test, TestingModule } from '@nestjs/testing';
import { GameTimeService } from './game-time.service';
// import { Subject, Subscription } from 'rxjs';
import { GameTimer } from '@app/interfaces/gameplay';
import { TIMER_RESOLUTION_MS } from '@app/constants/time.constants';

jest.useFakeTimers();

describe('GameTimeService', () => {
    let service: GameTimeService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameTimeService],
        }).compile();

        service = module.get<GameTimeService>(GameTimeService);
    });

    describe('getInitialTimer', () => {
        it('should return an initial timer object', () => {
            const timer = service.getInitialTimer();
            expect(timer).toEqual({
                timerId: null,
                counter: 0,
                isTurnChange: false,
                timerSubject: expect.anything(),
                timerSubscription: null,
            });
        });
    });

    // describe('getTimerSubject', () => {
    //     it('should return an observable of the timer subject', () => {
    //         const timer = service.getInitialTimer();
    //         const timerSubject = service.getTimerSubject(timer);
    //         expect(timerSubject).toBeDefined();
    //     });
    // });

    // describe('startTimer', () => {
    //     it('should set the counter and resume the timer', () => {
    //         const timer: GameTimer = service.getInitialTimer();
    //         const initialCount = 5;

    //         service.startTimer(timer, initialCount);

    //         expect(timer.counter).toBe(initialCount);
    //         expect(timer.timerId).toBeDefined();
    //     });
    // });

    // describe('resumeTimer', () => {
    //     it('should resume the timer and emit values', async () => {
    //         const timer: GameTimer = service.getInitialTimer();
    //         const initialCount = 3;
    //         timer.timerSubject = new Subject<number>();

    //         jest.spyOn(timer.timerSubject, 'next');

    //         service.startTimer(timer, initialCount);

    //         await jest.advanceTimersByTimeAsync(TIMER_RESOLUTION_MS);

    //         expect(timer.counter).toBe(initialCount - 1);
    //         expect(timer.timerSubject.next).toHaveBeenCalledWith(initialCount - 1);

    //         await jest.advanceTimersByTimeAsync(TIMER_RESOLUTION_MS);

    //         expect(timer.counter).toBe(initialCount - 2);
    //         expect(timer.timerSubject.next).toHaveBeenCalledWith(initialCount - 2);
    //     });
    // });

    // describe('stopTimer', () => {
    //     it('should clear the timer interval', () => {
    //         const timer: GameTimer = service.getInitialTimer();
    //         /* eslint-disable */
    //         timer.timerId = setInterval(() => { }, TIMER_RESOLUTION_MS);
    //         /* eslint-enable */
    //         service.stopTimer(timer);

    //         expect(timer.timerId).toBeDefined();
    //         service.stopTimer(timer);
    //     });
    // });
});
