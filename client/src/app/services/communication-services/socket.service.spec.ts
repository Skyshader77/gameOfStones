import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';
import { Socket } from 'socket.io-client';
import { RoomEvents, SocketRole } from '@app/constants/socket.constants';
import { environment } from 'src/environments/environment';
import { MOCK_SOCKET_DATA, MOCK_ROOM_ID, MOCK_SOCKET_EVENT } from '@app/constants/tests.constants';

describe('SocketService', () => {
    let service: SocketService;
    let socketSpies: Map<SocketRole, jasmine.SpyObj<Socket>>;

    beforeEach(() => {
        socketSpies = new Map<SocketRole, jasmine.SpyObj<Socket>>();

        for (const role of Object.values(SocketRole)) {
            const socketSpy = jasmine.createSpyObj('Socket', ['emit', 'disconnect', 'on']);
            socketSpies.set(role, socketSpy);
        }

        environment.serverUrl = 'http://localhost:3000';

        TestBed.configureTestingModule({
            providers: [SocketService],
        });
        service = TestBed.inject(SocketService);

        for (const [role, spy] of socketSpies.entries()) {
            service['sockets'].set(role, spy);
        }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit joinRoom event with the correct room ID for each socket role', () => {
        service.joinRoom(MOCK_ROOM_ID);

        socketSpies.forEach((socketSpy) => {
            expect(socketSpy.emit).toHaveBeenCalledWith(RoomEvents.JOIN, MOCK_ROOM_ID);
        });

        socketSpies.forEach((spy) => {
            expect(spy.emit).toHaveBeenCalledTimes(1);
        });
    });

    it('should disconnect the socket for a given role', () => {
        service.disconnect(SocketRole.CHAT);

        expect(socketSpies.get(SocketRole.CHAT)?.disconnect).toHaveBeenCalled();

        Object.values(SocketRole).forEach((role) => {
            if (role !== SocketRole.CHAT) {
                expect(socketSpies.get(role)?.disconnect).not.toHaveBeenCalled();
            }
        });
    });

    it('should emit an event to the specified socket role', () => {
        service.emit(SocketRole.CHAT, MOCK_SOCKET_EVENT, MOCK_SOCKET_DATA);

        expect(socketSpies.get(SocketRole.CHAT)?.emit).toHaveBeenCalledWith(MOCK_SOCKET_EVENT, MOCK_SOCKET_DATA);
    });

    it('should throw an error when emitting to a non-existing socket', () => {
        expect(() => service.emit('nonExistingRole' as SocketRole, MOCK_SOCKET_EVENT)).toThrowError("Le socket demandé n'existe pas!");
    });

    it('should return an observable for on() that emits data when the event is triggered', (done) => {
        const socketSpy = socketSpies.get(SocketRole.GAME);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketSpy?.on.and.callFake((eventName: string, callback: (...args: any[]) => void) => {
            if (eventName === MOCK_SOCKET_EVENT) {
                callback(MOCK_SOCKET_DATA);
            }
            return socketSpy;
        });

        service.on(SocketRole.GAME, MOCK_SOCKET_EVENT).subscribe((data) => {
            expect(data).toEqual(MOCK_SOCKET_DATA);
            done();
        });
    });

    it('should throw an error when calling on() with a non-existing socket', (done) => {
        service.on('nonExistingRole' as SocketRole, 'event').subscribe({
            error: (error) => {
                expect(error.message).toBe("Le socket demandé n'existe pas!");
                done();
            },
        });
    });
});
