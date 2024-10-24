import { TestBed } from '@angular/core/testing';

import { RoomEvents, SocketRole } from '@app/constants/socket.constants';
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

    let socketSpies: Map<SocketRole, jasmine.SpyObj<Socket>>;

    beforeEach(() => {
        socketSpies = new Map<SocketRole, jasmine.SpyObj<Socket>>();

        for (const role of Object.values(SocketRole)) {
            const socketSpy = jasmine.createSpyObj('Socket', ['emit', 'disconnect', 'on']);
            Object.defineProperty(socketSpy, 'id', { value: 'mockSocketId', writable: false });
            socketSpies.set(role, socketSpy);
        }

        socketServiceSpy = jasmine.createSpyObj('SocketService', ['getSockets']);

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

        const roomSocket = socketServiceSpy.getSockets.get(SocketRole.ROOM);

        expect(roomSocket?.emit).toHaveBeenCalledWith(RoomEvents.JOIN, mockSocketRoomData);
        expect(roomSocket?.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit joinRoom event for an invalid room ID', () => {
        service.joinRoom(MOCK_INVALID_ROOM_CODE, MOCK_PLAYER);

        const roomSocket = socketServiceSpy.getSockets.get(SocketRole.ROOM);

        expect(roomSocket?.emit).not.toHaveBeenCalled();
    });

    it('should not emit if sockets are not mapped in socketService', () => {
        const mockSockets = new Map<string, { id: string } | undefined>([
            [SocketRole.ROOM, undefined],
            [SocketRole.GAME, undefined],
            [SocketRole.CHAT, undefined],
        ]);

        Object.defineProperty(socketServiceSpy, 'getSockets', {
            get: () => mockSockets,
        });

        service.joinRoom(MOCK_ROOM.roomCode, MOCK_PLAYER);

        const roomSocket = socketServiceSpy.getSockets.get(SocketRole.ROOM);

        expect(roomSocket).toBeUndefined();
    });

    it('should emit createRoom event with the correct room ID', () => {
        service.createRoom(MOCK_ROOM.roomCode, MOCK_MAPS[0]);

        const roomSocket = socketServiceSpy.getSockets.get(SocketRole.ROOM);
        const expectedPayload = { roomId: MOCK_ROOM.roomCode, map: MOCK_MAPS[0] };

        expect(roomSocket?.emit).toHaveBeenCalledWith(RoomEvents.CREATE, expectedPayload);
        expect(roomSocket?.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit createRoom event for an invalid room ID', () => {
        service.createRoom(MOCK_INVALID_ROOM_CODE, MOCK_MAPS[0]);

        const roomSocket = socketServiceSpy.getSockets.get(SocketRole.ROOM);

        expect(roomSocket?.emit).not.toHaveBeenCalled();
    });

    it('should emit leaveRoom event with the correct room ID and socket IDs', () => {
        service.leaveRoom(MOCK_ROOM.roomCode, MOCK_PLAYER);

        const mockSocketRoomData = {
            roomId: MOCK_ROOM.roomCode,
            player: MOCK_PLAYER,
        };

        const roomSocket = socketServiceSpy.getSockets.get(SocketRole.ROOM);

        expect(roomSocket?.emit).toHaveBeenCalledWith(RoomEvents.LEAVE, mockSocketRoomData);
        expect(roomSocket?.emit).toHaveBeenCalledTimes(1);
    });
});
