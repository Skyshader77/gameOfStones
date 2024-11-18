import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MOCK_INVALID_ROOM_CODE, MOCK_MAPS, MOCK_PLAYERS, MOCK_ROOM } from '@app/constants/tests.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JoinErrors } from '@common/enums/join-errors.enum';
import { RoomEvents } from '@common/enums/sockets.events/room.events';
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

        socketServiceSpy = jasmine.createSpyObj('SocketService', ['getSockets', 'emit', 'on']);

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
            messaging: mockSocket.id || '',
            fight: mockSocket.id || '',
        };

        const mockSocketRoomData = {
            roomId: MOCK_ROOM.roomCode,
            playerSocketIndices: mockSocketIndices,
            player: MOCK_PLAYERS[0],
        };

        service.requestJoinRoom(MOCK_ROOM.roomCode, MOCK_PLAYERS[0]);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.Room, RoomEvents.DesireJoinRoom, mockSocketRoomData);
        expect(socketServiceSpy.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit joinRoom event for an invalid room ID', () => {
        service.requestJoinRoom(MOCK_INVALID_ROOM_CODE, MOCK_PLAYERS[0]);

        expect(socketServiceSpy.emit).not.toHaveBeenCalled();
    });

    it('should not emit if sockets are not mapped in socketService', () => {
        const mockSockets = new Map<string, { id: string } | undefined>([
            [Gateway.Room, undefined],
            [Gateway.Game, undefined],
            [Gateway.Messaging, undefined],
        ]);

        Object.defineProperty(socketServiceSpy, 'getSockets', {
            get: () => mockSockets,
        });

        service.requestJoinRoom(MOCK_ROOM.roomCode, MOCK_PLAYERS[0]);

        expect(socketServiceSpy.emit).not.toHaveBeenCalled();
    });

    it('should emit createRoom event with the correct room ID', () => {
        service.createRoom(MOCK_ROOM.roomCode, MOCK_MAPS[0], Avatar.MaleRanger);

        const expectedPayload = { roomCode: MOCK_ROOM.roomCode, map: MOCK_MAPS[0], avatar: Avatar.MaleRanger };

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.Room, RoomEvents.Create, expectedPayload);
        expect(socketServiceSpy.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit leaveRoom event', () => {
        service.leaveRoom();

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.Room, RoomEvents.Leave);
        expect(socketServiceSpy.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit handlePlayerCreationOpened event', () => {
        service.handlePlayerCreationOpened(MOCK_ROOM.roomCode);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.Room, RoomEvents.PlayerCreationOpened, MOCK_ROOM.roomCode);
        expect(socketServiceSpy.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit removePlayer event with the correct player name', () => {
        service.removePlayer(MOCK_PLAYERS[0].playerInfo.userName);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.Room, RoomEvents.DesireKickPlayer, MOCK_PLAYERS[0].playerInfo.userName);
        expect(socketServiceSpy.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit toggleRoomLock event with the correct room ID', () => {
        service.toggleRoomLock(MOCK_ROOM.roomCode);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.Room, RoomEvents.DesireToggleLock, { roomId: MOCK_ROOM.roomCode });
        expect(socketServiceSpy.emit).toHaveBeenCalledTimes(1);
    });

    it('should listen for RoomLocked event', (done) => {
        socketServiceSpy.on.and.returnValue(of(true));

        service.listenForRoomLocked().subscribe((locked) => {
            expect(locked).toBeTrue();
            done();
        });
    });

    it('should listen for RoomJoined event', (done) => {
        socketServiceSpy.on.and.returnValue(of(MOCK_PLAYERS[0]));

        service.listenForRoomJoined().subscribe((player) => {
            expect(player).toEqual(MOCK_PLAYERS[0]);
            done();
        });
    });

    it('should listen for JoinError event', (done) => {
        socketServiceSpy.on.and.returnValue(of(JoinErrors.RoomLocked));
        service.listenForJoinError().subscribe((error) => {
            expect(error).toBe(JoinErrors.RoomLocked);
            done();
        });
    });

    it('should listen for PlayerLimit event', (done) => {
        socketServiceSpy.on.and.returnValue(of(true));

        service.listenForPlayerLimit().subscribe((limitReached) => {
            expect(limitReached).toBeTrue();
            done();
        });
    });

    it('should listen for AvailableAvatars event', (done) => {
        const mockAvatars = [true, false, true];

        socketServiceSpy.on.and.returnValue(of(mockAvatars));

        service.listenForAvatarList().subscribe((availableAvatars) => {
            expect(availableAvatars).toEqual(mockAvatars);
            done();
        });
    });

    it('should listen for AvatarSelected event', (done) => {
        const mockSelectedIndex = 2;

        socketServiceSpy.on.and.returnValue(of(mockSelectedIndex));

        service.listenForAvatarSelected().subscribe((selectedAvatar) => {
            expect(selectedAvatar).toBe(mockSelectedIndex);
            done();
        });
    });
});
