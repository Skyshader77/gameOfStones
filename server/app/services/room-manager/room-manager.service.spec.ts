import { MOCK_EMPTY_ROOM_GAME, MOCK_MAPS, MOCK_NEW_ROOM_GAME, MOCK_PLAYERS, MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { SocketData } from '@app/interfaces/socket-data';
import { RoomService } from '@app/services/room/room.service';
import { MapSize } from '@common/enums/map-size.enum';
import { RoomEvents } from '@common/enums/sockets-events/room.events';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { Server, Socket } from 'socket.io';
import { RoomManagerService } from './room-manager.service';

describe('RoomManagerService', () => {
    let service: RoomManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomManagerService,
                {
                    provide: RoomService,
                    useValue: {
                        deleteRoomByCode: jest.fn(),
                        addRoom: jest.fn(),
                        modifyRoom: jest.fn(),
                        getRoomLockStatus: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<RoomManagerService>(RoomManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a new room with the given roomId', () => {
        const roomCode = MOCK_EMPTY_ROOM_GAME.room.roomCode;
        service.createRoom(roomCode);

        const room = service['rooms'].get(roomCode);
        expect({
            ...room,
            room: {
                ...room.room,
                _id: expect.any(ObjectId),
            },
        }).toEqual({
            ...MOCK_EMPTY_ROOM_GAME,
            room: {
                ...MOCK_EMPTY_ROOM_GAME.room,
                _id: expect.any(ObjectId),
            },
        });
    });

    it('should return the current player if the room exists and the player is found', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        const mockRoom = { ...MOCK_NEW_ROOM_GAME, players: MOCK_PLAYERS };
        service['rooms'].set(roomCode, mockRoom);

        mockRoom.game.currentPlayer = MOCK_PLAYERS[0].playerInfo.userName;

        const currentPlayer = service.getCurrentRoomPlayer(roomCode);

        expect(currentPlayer).toEqual(MOCK_PLAYERS[0]);
    });

    it('should return null if the room does not exist', () => {
        const nonExistentRoomCode = 'NON_EXISTENT_ROOM';
        const player = service.getCurrentRoomPlayer(nonExistentRoomCode);

        expect(player).toBeNull();
    });

    it('should return null if the current player does not exist in the room', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        const mockRoom = { ...MOCK_NEW_ROOM_GAME, players: MOCK_PLAYERS };
        service['rooms'].set(roomCode, mockRoom);

        mockRoom.game.currentPlayer = 'UnknownPlayer';

        const currentPlayer = service.getCurrentRoomPlayer(roomCode);

        expect(currentPlayer).toBeNull();
    });

    it('should add a room to the rooms map', () => {
        service.addRoom(MOCK_ROOM_GAME);
        const room = service.getRoom(MOCK_ROOM_GAME.room.roomCode);
        expect({
            ...room,
            room: {
                ...room.room,
                _id: expect.any(ObjectId),
            },
        }).toEqual({
            ...MOCK_ROOM_GAME,
            room: {
                ...MOCK_ROOM_GAME.room,
                _id: expect.any(ObjectId),
            },
        });
    });

    it('should return the room if it exists', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        service['rooms'].set(roomCode, MOCK_ROOM_GAME);

        const room = service.getRoom(roomCode);
        expect(room).toBeDefined();
        expect(room).toEqual(MOCK_ROOM_GAME);
    });

    it('should return null if the room does not exist', () => {
        const nonExistentRoomId = 'nonexistent';
        const room = service.getRoom(nonExistentRoomId);

        expect(room).toBeUndefined();
    });

    it('should add a player to the room', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        service['rooms'].set(roomCode, MOCK_NEW_ROOM_GAME);

        service.addPlayerToRoom(roomCode, MOCK_PLAYERS[0]);
        const room = service['rooms'].get(roomCode);

        expect(room?.players.length).toBe(1);
        expect(room?.players[0]).toEqual(MOCK_PLAYERS[0]);
    });

    it('should throw an error if adding a player to a non-existent room', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;

        expect(() => service.addPlayerToRoom(roomCode, MOCK_PLAYERS[0])).toThrowError();
    });

    it('should remove a player from the room when removePlayerFromRoom is called', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.players = JSON.parse(JSON.stringify(MOCK_PLAYERS));
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const playerNameToRemove = MOCK_PLAYERS[0].playerInfo.userName;
        service['rooms'].set(roomCode, mockRoom);

        service.removePlayerFromRoom(roomCode, playerNameToRemove);

        const updatedRoom = service['rooms'].get(roomCode);
        expect(updatedRoom?.players.length).toBe(1);
        expect(updatedRoom?.players).not.toContain(playerNameToRemove);
    });

    it('should delete a room and remove it from the rooms map', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        service['rooms'].set(roomCode, MOCK_ROOM_GAME);

        service.deleteRoom(roomCode);
        const room = service.getRoom(roomCode);

        expect(room).toBeUndefined();
        expect(service['roomService'].deleteRoomByCode).toHaveBeenCalledWith(roomCode);
    });

    it('should toggle the lock state of the room', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        service['rooms'].set(roomCode, MOCK_ROOM_GAME);

        service.toggleIsLocked(MOCK_ROOM_GAME.room);

        expect(service['roomService'].modifyRoom).toHaveBeenCalledWith(MOCK_ROOM_GAME.room);
    });

    it('should assign a map to the existing room', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        service['rooms'].set(roomCode, MOCK_NEW_ROOM_GAME);

        service.assignMapToRoom(roomCode, MOCK_MAPS[0]);

        const room = service.getRoom(roomCode);
        expect(room).toBeDefined();
        expect(room?.game.map).toEqual(MOCK_MAPS[0]);
    });

    it('should return the player in the room if they exist', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        service['rooms'].set(roomCode, MOCK_NEW_ROOM_GAME);

        const playerName = MOCK_PLAYERS[0].playerInfo.userName;
        const player = service.getPlayerInRoom(roomCode, playerName);

        expect(player).toEqual(MOCK_PLAYERS[0]);
    });

    it('should return null if the player does not exist in the room', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        const mockRoom = { ...MOCK_NEW_ROOM_GAME, players: MOCK_PLAYERS };
        service['rooms'].set(roomCode, mockRoom);

        const nonExistentPlayerName = 'nonexistent';
        const player = service.getPlayerInRoom(roomCode, nonExistentPlayerName);
        expect(player).toBeNull();
    });

    it('should return null if the room does not exist', () => {
        const nonExistentRoomCode = 'NON_EXISTENT_ROOM';
        const playerName = MOCK_PLAYERS[0].playerInfo.userName;

        const player = service.getPlayerInRoom(nonExistentRoomCode, playerName);
        expect(player).toBeNull();
    });

    it('should return all players in the room', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        const mockRoom = { ...MOCK_NEW_ROOM_GAME, players: MOCK_PLAYERS };
        service['rooms'].set(roomCode, mockRoom);

        const players = service.getAllRoomPlayers(roomCode);
        expect(players).toEqual(MOCK_PLAYERS);
    });

    it('should return null if there are no players in the room', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        const emptyRoom = { ...MOCK_NEW_ROOM_GAME, players: [] };
        service['rooms'].set(roomCode, emptyRoom);

        const players = service.getAllRoomPlayers(roomCode);
        expect(players).toEqual([]);
    });

    it('should return null if the room does not exist', () => {
        const nonExistentRoomCode = 'nonexistent';
        const players = service.getAllRoomPlayers(nonExistentRoomCode);

        expect(players).toBeUndefined();
    });

    it('should return true if the player limit is reached', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        const mockRoom = { ...MOCK_NEW_ROOM_GAME, players: [...MOCK_PLAYERS] };
        service['rooms'].set(roomCode, mockRoom);

        expect(service.isPlayerLimitReached(roomCode)).toBe(true);
    });

    it('should return false if the player limit is not reached', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        const mockRoom = { ...MOCK_NEW_ROOM_GAME, players: [MOCK_PLAYERS[0]] };
        service['rooms'].set(roomCode, mockRoom);

        expect(service.isPlayerLimitReached(roomCode)).toBe(false);
    });

    it('should emit join and player list events, and handle player limit correctly', () => {
        const roomCode = MOCK_NEW_ROOM_GAME.room.roomCode;
        const mockRoom = { ...MOCK_NEW_ROOM_GAME, players: [] };
        service['rooms'].set(roomCode, mockRoom);

        const mockSocket: Partial<Socket> = {
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
        };

        const mockServer: Partial<Server> = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };

        const player = MOCK_PLAYERS[0];
        const socketData: SocketData = {
            server: mockServer as Server,
            socket: mockSocket as Socket,
            player,
            roomCode,
        };

        service.handleJoiningSocketEmissions(socketData);

        expect(mockSocket.emit).toHaveBeenCalledWith(RoomEvents.Join, player);
        expect(mockSocket.emit).toHaveBeenCalledWith(RoomEvents.PlayerList, mockRoom.players);
        expect(mockServer.to(roomCode).emit).toHaveBeenCalledWith(RoomEvents.RoomLocked, false);

        mockRoom.players.push(player);

        mockRoom.players = [...mockRoom.players, ...MOCK_PLAYERS.slice(1, MapSize.Small)];

        service.handleJoiningSocketEmissions(socketData);

        expect(mockServer.to).toHaveBeenCalledWith(roomCode);
        expect(mockServer.to(roomCode).emit).toHaveBeenCalledWith(RoomEvents.RoomLocked, true);
        expect(mockServer.to(roomCode).emit).toHaveBeenCalledWith(RoomEvents.PlayerLimitReached, true);
        expect(mockServer.to(roomCode).emit).toHaveBeenCalledWith(RoomEvents.RoomLocked, true);
    });
});
