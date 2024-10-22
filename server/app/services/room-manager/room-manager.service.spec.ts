import { MOCK_PLAYERS, MOCK_ROOM_GAME, MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED } from '@app/constants/test.constants';
import { RoomService } from '@app/services/room/room.service';
import { Test, TestingModule } from '@nestjs/testing';
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
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        service.createRoom(roomCode);

        const room = service['rooms'].get(roomCode);
        expect(room).toEqual(MOCK_ROOM_GAME);
    });

    it('should add a room to the rooms map', () => {
        service.addRoom(MOCK_ROOM_GAME);
        const room = service.getRoom(MOCK_ROOM_GAME.room.roomCode);

        expect(room).toEqual(MOCK_ROOM_GAME);
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
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        service['rooms'].set(roomCode, MOCK_ROOM_GAME);

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
        const playerToRemove = MOCK_PLAYERS[0];
        service['rooms'].set(roomCode, mockRoom);

        service.removePlayerFromRoom(roomCode, playerToRemove);

        const updatedRoom = service['rooms'].get(roomCode);
        expect(updatedRoom?.players.length).toBe(1);
        expect(updatedRoom?.players).not.toContain(playerToRemove);
    });

    it('should update a room when updateRoom is called', () => {
        const mockRoomUpdated = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED));
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        service.updateRoom(roomCode, mockRoomUpdated);

        const updatedRoom = service['rooms'].get(roomCode);
        expect(updatedRoom).toBe(mockRoomUpdated);
    });
});
