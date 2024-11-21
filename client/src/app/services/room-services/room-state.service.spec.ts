import { TestBed } from '@angular/core/testing';
import { RoomSocketService } from '@app/services/communication-services/room-socket/room-socket.service';
import { Subject } from 'rxjs';
import { RoomStateService } from './room-state.service';

describe('RoomStateService', () => {
    let service: RoomStateService;
    let roomSocketServiceSpy: jasmine.SpyObj<RoomSocketService>;

    let roomLockedSubject: Subject<boolean>;
    let playerLimitSubject: Subject<boolean>;

    beforeEach(() => {
        roomLockedSubject = new Subject<boolean>();
        playerLimitSubject = new Subject<boolean>();

        roomSocketServiceSpy = jasmine.createSpyObj('RoomSocketService', ['listenForRoomLocked', 'listenForPlayerLimit']);
        roomSocketServiceSpy.listenForRoomLocked.and.returnValue(roomLockedSubject.asObservable());
        roomSocketServiceSpy.listenForPlayerLimit.and.returnValue(playerLimitSubject.asObservable());

        TestBed.configureTestingModule({
            providers: [RoomStateService, { provide: RoomSocketService, useValue: roomSocketServiceSpy }],
        });

        service = TestBed.inject(RoomStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set isLocked to true when room is locked', () => {
        service.initialize();
        roomLockedSubject.next(true);
        expect(service.isLocked).toBeTrue();
    });

    it('should set isLocked to false when room is unlocked', () => {
        service.initialize();
        roomLockedSubject.next(false);
        expect(service.isLocked).toBeFalse();
    });

    it('should set playerLimitReached to true when player limit is reached', () => {
        service.initialize();
        playerLimitSubject.next(true);
        expect(service.playerLimitReached).toBeTrue();
    });

    it('should set playerLimitReached to false when player limit is not reached', () => {
        service.initialize();
        playerLimitSubject.next(false);
        expect(service.playerLimitReached).toBeFalse();
    });

    it('should unsubscribe from roomLockedListener and playerLimitListener on cleanup', () => {
        service.initialize();
        service.onCleanUp();
        expect(() => roomLockedSubject.next(true)).not.toThrow();
        expect(() => playerLimitSubject.next(true)).not.toThrow();
    });

    it('should reset playerLimitReached and currentRoom properties on cleanup', () => {
        service.initialize();
        service.onCleanUp();
        expect(service.playerLimitReached).toBeFalse();
        expect(service.roomCode).toBe('');
        expect(service.isLocked).toBeFalse();
    });

    it('should return the current roomCode when accessed', () => {
        service.roomCode = 'testCode';
        expect(service.roomCode).toBe('testCode');
    });

    it('should update the roomCode when set', () => {
        service.roomCode = 'newCode';
        expect(service.roomCode).toBe('newCode');
    });
});
