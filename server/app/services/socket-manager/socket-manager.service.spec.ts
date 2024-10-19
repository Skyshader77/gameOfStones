import { Gateway } from '@app/constants/gateways.constants';
import { MOCK_PLAYER, MOCK_ROOM_GAME } from '@app/constants/test-constants';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { PlayerSocketIndices } from '@common/interfaces/player-socket-indices';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { SocketManagerService } from './socket-manager.service';

describe('SocketManagerService', () => {
    let service: SocketManagerService;
    let roomManagerSpy: Partial<RoomManagerService>; // Use Partial to only include required methods

    beforeEach(async () => {
        roomManagerSpy = {
            createRoom: jest.fn(),
            getRoom: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [SocketManagerService, { provide: RoomManagerService, useValue: roomManagerSpy }],
        }).compile();

        service = module.get<SocketManagerService>(SocketManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should assign a new room and call createRoom', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        service.assignNewRoom(roomCode);

        expect(service.playerSocketMap.has(roomCode)).toBe(true);
        expect(roomManagerSpy.createRoom).toHaveBeenCalledWith(roomCode);
    });

    it('should set a gateway server', () => {
        const mockServer = {} as Server;
        const gateway = Gateway.ROOM;

        service.setGatewayServer(gateway, mockServer);

        expect(service['servers'].get(gateway)).toBe(mockServer);
    });

    it('should register a socket by adding it to the sockets map', () => {
        const mockSocketId = 'socket1';
        const mockSocket: Socket = {
            id: mockSocketId,
            rooms: new Set(),
        } as Socket;

        service.registerSocket(mockSocket);

        expect(service['sockets'].get(mockSocketId)).toBe(mockSocket);
    });

    it('should return the room code of a socket', () => {
        const mockSocket = {
            id: 'socket1',
            rooms: new Set(['socket1', 'room1']),
        } as Socket;

        const roomCode = service.getSocketRoomCode(mockSocket);

        expect(roomCode).toBe('room1');
    });

    it('should return null if socket is not in a room', () => {
        const mockSocket = {
            id: 'socket1',
            rooms: new Set(['socket1']),
        } as Socket;

        const roomCode = service.getSocketRoomCode(mockSocket);

        expect(roomCode).toBeNull();
    });

    it('should return the room associated with a socket and call roomManagerService.getRoom', () => {
        const mockSocket = {
            id: 'socket1',
            rooms: new Set(['socket1', 'room1']),
        } as Socket;

        service.getSocketRoom(mockSocket);

        expect(roomManagerSpy.getRoom).toHaveBeenCalledWith('room1');
    });

    it('should return null if the socket is not in any room', () => {
        const mockSocket = {
            id: 'socket1',
            rooms: new Set(['socket1']),
        } as unknown as Socket;

        const room = service.getSocketRoom(mockSocket);

        expect(room).toBeNull();
    });

    it('should assign sockets to a player', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const playerName = MOCK_PLAYER.playerInfo.userName;
        const mockSocketIndices: PlayerSocketIndices = {
            room: 'roomSocket',
            game: 'gameSocket',
            chat: 'chatSocket',
        };

        service['playerSockets'].set(roomCode, new Map());
        service.assignSocketsToPlayer(roomCode, playerName, mockSocketIndices);

        expect(service.playerSocketMap.get(roomCode).get(playerName)).toEqual(mockSocketIndices);
    });

    it("should get a player's socket from a room and gateway", () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const playerName = MOCK_PLAYER.playerInfo.userName;
        const mockSocketId = 'socket1';
        const mockSocket: Socket = {
            id: mockSocketId,
            rooms: new Set([roomCode]),
        } as Socket;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).playerSockets.set(roomCode, new Map([[playerName, { [Gateway.ROOM]: mockSocketId }]]));
        service['sockets'].set(mockSocketId, mockSocket);

        const socket = service.getPlayerSocket(roomCode, playerName, Gateway.ROOM);

        expect(socket).toBe(mockSocket);
    });

    it('should return undefined if the socketId is not mapped to a socket', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const playerName = MOCK_PLAYER.playerInfo.userName;
        const mockSocketId = 'socket1';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any).playerSockets.set(roomCode, new Map([[playerName, { [Gateway.ROOM]: mockSocketId }]]));
        // We never set the mockSocketId to an actual socket in the sockets map

        const socket = service.getPlayerSocket(roomCode, playerName, Gateway.ROOM);

        expect(socket).toBeUndefined();
    });
});
