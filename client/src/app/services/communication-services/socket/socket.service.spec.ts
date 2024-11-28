import { TestBed } from '@angular/core/testing';
import { MOCK_SOCKET_EVENT, MOCK_SOCKET_GENERIC_DATA } from '@app/constants/tests.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SocketService } from './socket.service';

describe('SocketService', () => {
    let service: SocketService;
    let socketSpies: Map<Gateway, jasmine.SpyObj<Socket>>;

    beforeEach(() => {
        socketSpies = new Map<Gateway, jasmine.SpyObj<Socket>>();

        for (const role of Object.values(Gateway)) {
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

    it('should return the correct sockets map', () => {
        const mockSockets = new Map<Gateway, { id: string }>([
            [Gateway.Room, { id: 'roomSocketId' }],
            [Gateway.Game, { id: 'gameSocketId' }],
            [Gateway.Messaging, { id: 'chatSocketId' }],
            [Gateway.Fight, { id: 'fightSocketId' }],
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).sockets = mockSockets;

        const retrievedSockets = service.getSockets;

        expect(retrievedSockets).toEqual(mockSockets);
        expect(retrievedSockets.get(Gateway.Room)?.id).toBe('roomSocketId');
        expect(retrievedSockets.get(Gateway.Game)?.id).toBe('gameSocketId');
        expect(retrievedSockets.get(Gateway.Messaging)?.id).toBe('chatSocketId');
    });

    it('should disconnect the socket for a given role', () => {
        service.disconnect(Gateway.Messaging);

        expect(socketSpies.get(Gateway.Messaging)?.disconnect).toHaveBeenCalled();

        Object.values(Gateway).forEach((role) => {
            if (role !== Gateway.Messaging) {
                expect(socketSpies.get(role)?.disconnect).not.toHaveBeenCalled();
            }
        });
    });

    it('should disconnect all sockets', () => {
        service.disconnectAll();

        Object.values(Gateway).forEach((role) => {
            expect(socketSpies.get(role)?.disconnect).toHaveBeenCalled();
        });
    });

    it('should emit an event to the specified socket role', () => {
        service.emit(Gateway.Messaging, MOCK_SOCKET_EVENT, MOCK_SOCKET_GENERIC_DATA);

        expect(socketSpies.get(Gateway.Messaging)?.emit).toHaveBeenCalledWith(MOCK_SOCKET_EVENT, MOCK_SOCKET_GENERIC_DATA);
    });

    it('should throw an error when emitting to a non-existing socket', () => {
        expect(() => service.emit('nonExistingRole' as Gateway, MOCK_SOCKET_EVENT)).toThrowError("Le socket demandé n'existe pas!");
    });

    it('should return an observable for on() that emits data when the event is triggered', (done) => {
        const socketSpy = socketSpies.get(Gateway.Game);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketSpy?.on.and.callFake((eventName: string, callback: (...args: any[]) => void) => {
            if (eventName === MOCK_SOCKET_EVENT) {
                callback(MOCK_SOCKET_GENERIC_DATA);
            }
            return socketSpy;
        });

        service.on(Gateway.Game, MOCK_SOCKET_EVENT).subscribe((data) => {
            expect(data).toEqual(MOCK_SOCKET_GENERIC_DATA);
            done();
        });
    });

    it('should throw an error when calling on() with a non-existing socket', (done) => {
        service.on('nonExistingRole' as Gateway, 'event').subscribe({
            error: (error) => {
                expect(error.message).toBe("Le socket demandé n'existe pas!");
                done();
            },
        });
    });
});
