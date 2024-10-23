import {
    MOCK_PLAYERS_DIFFERENT_SPEEDS,
    MOCK_ROOM_GAME,
    MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED,
    MOCK_ROOM_GAME_PLAYER_ABANDONNED
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
        const game = MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED;
        game.game.currentPlayer = 0;
        const roomCode = game.room.roomCode;
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(game);

        const nextPlayer = service.nextTurn(roomCode, 'mockPlayer1');
        expect(getRoomSpy).toHaveBeenCalledWith(game.room.roomCode);
        expect(nextPlayer).toBe('mockPlayer2');
    });

    it('should wrap around to first player when current player is last in sorted order', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED));
        mockRoom.game.currentPlayer = 2;
        mockRoom.players = MOCK_PLAYERS_DIFFERENT_SPEEDS;
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(mockRoom);
        const nextPlayer = service.nextTurn(roomCode, 'mockPlayer3');
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED.room.roomCode);
        expect(nextPlayer).toBe('mockPlayer1');
    });

    it('should not set a player turn when that player has abandonned', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_PLAYER_ABANDONNED));
        mockRoom.game.currentPlayer = 0;
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(mockRoom);
        const nextPlayer = service.nextTurn(roomCode, 'mockPlayer1');
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_PLAYER_ABANDONNED.room.roomCode);
        expect(nextPlayer).toBe('mockPlayer3');
    });

    it('should not set a player turn when the player that called the function is not the current player', () => {
        const roomCode = MOCK_ROOM_GAME.room.roomCode;
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_PLAYER_ABANDONNED));
        mockRoom.game.currentPlayer = 1;
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(mockRoom);
        const nextPlayer = service.nextTurn(roomCode, 'mockPlayer1');
        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_PLAYER_ABANDONNED.room.roomCode);
        expect(nextPlayer).toBe(null);
    });
});
