import {
    MOCK_PLAYERS_DIFFERENT_SPEEDS,
    MOCK_ROOM_GAME,
    MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED,
    MOCK_ROOM_GAME_PLAYER_ABANDONNED,
} from '@app/constants/test.constants';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameTurnService } from './game-turn.service';

describe('GameTurnService', () => {
    let service: GameTurnService;
    let roomManagerService: RoomManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameTurnService,
                {
                    provide: RoomManagerService,
                    useValue: {
                        getRoom: jest.fn(),
                        updateRoom: jest.fn(),
                    },
                },
            ],
        }).compile();
        service = module.get<GameTurnService>(GameTurnService);
        roomManagerService = module.get<RoomManagerService>(RoomManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should set next player as active player when not at end of list', () => {
        const roomCode = MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED.room.roomCode;
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED);
        const setRoomSpy = jest.spyOn(roomManagerService, 'updateRoom');

        const nextPlayer = service.setNextActivePlayer(roomCode, 'mockPlayer1');
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED.room.roomCode);
        expect(setRoomSpy).toHaveBeenCalledTimes(1);
        expect(nextPlayer).toBe('mockPlayer2');
    });

    it('should wrap around to first player when current player is last in sorted order', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.players = MOCK_PLAYERS_DIFFERENT_SPEEDS;
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED);
        const setRoomSpy = jest.spyOn(roomManagerService, 'updateRoom');
        const nextPlayer = service.setNextActivePlayer(roomCode, 'mockPlayer3');
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED.room.roomCode);
        expect(setRoomSpy).toHaveBeenCalledTimes(1);
        expect(nextPlayer).toBe('mockPlayer1');
    });

    it('should not set a player turn when that player has abandonned', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.players = MOCK_PLAYERS_DIFFERENT_SPEEDS;
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_GAME_PLAYER_ABANDONNED);
        const setRoomSpy = jest.spyOn(roomManagerService, 'updateRoom');
        const nextPlayer = service.setNextActivePlayer(roomCode, 'mockPlayer1');
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_PLAYER_ABANDONNED.room.roomCode);
        expect(setRoomSpy).toHaveBeenCalledTimes(1);
        expect(nextPlayer).toBe('mockPlayer3');
    });

    it('should set the player with highest speed as first player', () => {
        const roomCode = MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED.room.roomCode;
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED);
        const updateRoomSpy = jest.spyOn(roomManagerService, 'updateRoom');

        const firstPlayer = service.determineWhichPlayerGoesFirst(roomCode);

        expect(getRoomSpy).toHaveBeenCalledWith(roomCode);
        expect(updateRoomSpy).toHaveBeenCalledTimes(1);
        expect(firstPlayer).toBe('mockPlayer1');
    });
});
