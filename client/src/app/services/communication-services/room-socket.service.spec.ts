import { TestBed } from '@angular/core/testing';

import { Gateway } from '@common/constants/gateway.constants';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { MOCK_INVALID_ROOM_CODE, MOCK_MAPS, MOCK_PLAYER, MOCK_ROOM } from '@app/constants/tests.constants';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Socket } from 'socket.io-client';
import { RoomSocketService } from './room-socket.service';
import { SocketService } from './socket.service';

describe('RoomSocketService', () => {
    let service: RoomSocketService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    const mockSocket = {
        id: 'mockSocketId',
        emit: jasmine.createSpy('emit'),
    } as unknown as Socket;

    let socketSpies: Map<Gateway, jasmine.SpyObj<Socket>>;

    beforeEach(() => {
        socketSpies = new Map<Gateway, jasmine.SpyObj<Socket>>();

        for (const role of Object.values(Gateway)) {
            const socketSpy = jasmine.createSpyObj('Socket', ['emit', 'disconnect', 'on']);
            Object.defineProperty(socketSpy, 'id', { value: 'mockSocketId', writable: false });
            socketSpies.set(role, socketSpy);
        }

        socketServiceSpy = jasmine.createSpyObj('SocketService', ['getSockets', 'emit']);

        Object.defineProperty(socketServiceSpy, 'getSockets', {
            get: () => socketSpies,
            configurable: true,
        });

        TestBed.configureTestingModule({
            providers: [RoomSocketService, { provide: SocketService, useValue: socketServiceSpy }],
        });
        service = TestBed.inject(RoomSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit joinRoom event with the correct room ID and socket IDs', () => {
        const mockSocketIndices: PlayerSocketIndices = {
            room: mockSocket.id || '',
            game: mockSocket.id || '',
            chat: mockSocket.id || '',
        };

        const mockSocketRoomData = {
            roomId: MOCK_ROOM.roomCode,
            playerSocketIndices: mockSocketIndices,
            player: MOCK_PLAYER,
        };

        service.joinRoom(MOCK_ROOM.roomCode, MOCK_PLAYER);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.ROOM, RoomEvents.JOIN, mockSocketRoomData);
        expect(socketServiceSpy.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit joinRoom event for an invalid room ID', () => {
        service.joinRoom(MOCK_INVALID_ROOM_CODE, MOCK_PLAYER);

        expect(socketServiceSpy.emit).not.toHaveBeenCalled();
    });

    it('should not emit if sockets are not mapped in socketService', () => {
        const mockSockets = new Map<string, { id: string } | undefined>([
            [Gateway.ROOM, undefined],
            [Gateway.GAME, undefined],
            [Gateway.CHAT, undefined],
        ]);

        Object.defineProperty(socketServiceSpy, 'getSockets', {
            get: () => mockSockets,
        });

        service.joinRoom(MOCK_ROOM.roomCode, MOCK_PLAYER);

        expect(socketServiceSpy.emit).not.toHaveBeenCalled();
    });

    it('should emit createRoom event with the correct room ID', () => {
        service.createRoom(MOCK_ROOM.roomCode, MOCK_MAPS[0]);

        const expectedPayload = { roomId: MOCK_ROOM.roomCode, map: MOCK_MAPS[0] };

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.ROOM, RoomEvents.CREATE, expectedPayload);
        expect(socketServiceSpy.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit createRoom event for an invalid room ID', () => {
        service.createRoom(MOCK_INVALID_ROOM_CODE, MOCK_MAPS[0]);

        expect(socketServiceSpy.emit).not.toHaveBeenCalled();
    });

    it('should emit leaveRoom event with the correct room ID and socket IDs', () => {
        service.leaveRoom();

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.ROOM, RoomEvents.LEAVE);
        expect(socketServiceSpy.emit).toHaveBeenCalledTimes(1);
    });
});
