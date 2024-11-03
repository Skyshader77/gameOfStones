import { MOCK_EMPTY_ROOM_GAME, MOCK_NEW_ROOM_GAME, MOCK_PLAYERS, MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { RoomService } from '@app/services/room/room.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
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
});
