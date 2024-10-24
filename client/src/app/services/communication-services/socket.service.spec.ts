import { TestBed } from '@angular/core/testing';
import { Gateway } from '@common/interfaces/gateway.constants';
import { MOCK_SOCKET_EVENT, MOCK_SOCKET_GENERIC_DATA } from '@app/constants/tests.constants';
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
            [Gateway.ROOM, { id: 'roomSocketId' }],
            [Gateway.GAME, { id: 'gameSocketId' }],
            [Gateway.CHAT, { id: 'chatSocketId' }],
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).sockets = mockSockets;

        const retrievedSockets = service.getSockets;

        expect(retrievedSockets).toEqual(mockSockets);
        expect(retrievedSockets.get(Gateway.ROOM)?.id).toBe('roomSocketId');
        expect(retrievedSockets.get(Gateway.GAME)?.id).toBe('gameSocketId');
        expect(retrievedSockets.get(Gateway.CHAT)?.id).toBe('chatSocketId');
    });

    it('should disconnect the socket for a given role', () => {
        service.disconnect(Gateway.CHAT);

        expect(socketSpies.get(Gateway.CHAT)?.disconnect).toHaveBeenCalled();

        Object.values(Gateway).forEach((role) => {
            if (role !== Gateway.CHAT) {
                expect(socketSpies.get(role)?.disconnect).not.toHaveBeenCalled();
            }
        });
    });

    it('should emit an event to the specified socket role', () => {
        service.emit(Gateway.CHAT, MOCK_SOCKET_EVENT, MOCK_SOCKET_GENERIC_DATA);

        expect(socketSpies.get(Gateway.CHAT)?.emit).toHaveBeenCalledWith(MOCK_SOCKET_EVENT, MOCK_SOCKET_GENERIC_DATA);
    });

    it('should throw an error when emitting to a non-existing socket', () => {
        expect(() => service.emit('nonExistingRole' as Gateway, MOCK_SOCKET_EVENT)).toThrowError("Le socket demandé n'existe pas!");
    });

    it('should return an observable for on() that emits data when the event is triggered', (done) => {
        const socketSpy = socketSpies.get(Gateway.GAME);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketSpy?.on.and.callFake((eventName: string, callback: (...args: any[]) => void) => {
            if (eventName === MOCK_SOCKET_EVENT) {
                callback(MOCK_SOCKET_GENERIC_DATA);
            }
            return socketSpy;
        });

        service.on(Gateway.GAME, MOCK_SOCKET_EVENT).subscribe((data) => {
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
