import { TestBed } from '@angular/core/testing';
import { GameTimeService } from './game-time.service';
import { SocketService } from '@app/services/communication-services/socket.service';
import { of } from 'rxjs';

describe('GameTimeService', () => {
    let service: GameTimeService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    const MOCK_COUNTER = 10;
    const MOCK_COUNTER_OVER = 0;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);

        TestBed.configureTestingModule({
            providers: [GameTimeService, { provide: SocketService, useValue: socketServiceSpy }],
        });

        service = TestBed.inject(GameTimeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should listen to remaining time on initialize', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const listenSpy = spyOn<any>(service, 'listenToRemainingTime');
        service.initialize();

        expect(listenSpy).toHaveBeenCalled();
    });

    it('should get counter on remainingTime', () => {
        service['counter'] = MOCK_COUNTER;
        expect(service.getRemainingTime()).toEqual(MOCK_COUNTER);
    });

    it('should tell that timer is over if 0 on isTimerOver', () => {
        service['counter'] = MOCK_COUNTER_OVER;
        expect(service.isTimeOver()).toEqual(true);
    });

    it('should tell that timer is not over if not 0 on isTimerOver', () => {
        service['counter'] = MOCK_COUNTER;
        expect(service.isTimeOver()).toEqual(false);
    });

    it('should set the counter', () => {
        service.setStartTime(MOCK_COUNTER);
        expect(service['counter']).toEqual(MOCK_COUNTER);
    });

    it('should set the listener on listenTo', () => {
        socketServiceSpy.on.and.returnValue(of(MOCK_COUNTER));
        service['listenToRemainingTime']();
        expect(service['counter']).toEqual(MOCK_COUNTER);
    });
});
