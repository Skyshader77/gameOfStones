import {
    MOCK_NEW_PLAYER_FIVE,
    MOCK_NEW_PLAYER_FOUR,
    MOCK_NEW_PLAYER_ORGANIZER,
    MOCK_NEW_PLAYER_SIX,
    MOCK_NEW_PLAYER_THREE,
    MOCK_NEW_PLAYER_TWO,
    MOCK_ROOM_START_POSITION,
} from '@app/constants/gameplay.test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { GameStatus } from '@common/enums/game-status.enum';
import { GameStartService } from './game-start.service';

describe('GameStartService', () => {
    let service: GameStartService;

    beforeEach(() => {
        service = new GameStartService();
    });

    it('should start the game if conditions are met', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_START_POSITION)) as RoomGame;
        const result = service.startGame(mockRoom, MOCK_NEW_PLAYER_ORGANIZER);

        expect(result).toBeDefined();
        expect(mockRoom.game.status).toBe(GameStatus.OverWorld);
        expect(result).toHaveLength(mockRoom.players.length);
    });

    it('should not start the game if the room is not locked', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_START_POSITION)) as RoomGame;
        mockRoom.room.isLocked = false;
        const result = service.startGame(mockRoom, MOCK_NEW_PLAYER_ORGANIZER);

        expect(result).toBeNull();
        expect(mockRoom.game.status).not.toBe(GameStatus.OverWorld);
    });

    it('should not start the game if player count is insufficient', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_START_POSITION)) as RoomGame;
        mockRoom.players = [MOCK_NEW_PLAYER_ORGANIZER];
        const result = service.startGame(mockRoom, MOCK_NEW_PLAYER_ORGANIZER);

        expect(result).toBeNull();
        expect(mockRoom.game.status).not.toBe(GameStatus.OverWorld);
    });

    it('should determine play order based on speed', () => {
        const room = {
            ...MOCK_ROOM_START_POSITION,
            players: [
                MOCK_NEW_PLAYER_ORGANIZER,
                MOCK_NEW_PLAYER_TWO,
                MOCK_NEW_PLAYER_THREE,
                MOCK_NEW_PLAYER_FOUR,
                MOCK_NEW_PLAYER_FIVE,
                MOCK_NEW_PLAYER_SIX,
            ],
        };

        const playOrder = service['determinePlayOrder'](room);

        expect(playOrder).toEqual(['Player6', 'Player5', 'Player4', 'Player3', 'Player2', 'Player1']);
    });

    it('should assign starting positions to players', () => {
        const room = {
            ...MOCK_ROOM_START_POSITION,
            players: [
                MOCK_NEW_PLAYER_ORGANIZER,
                MOCK_NEW_PLAYER_TWO,
                MOCK_NEW_PLAYER_THREE,
                MOCK_NEW_PLAYER_FOUR,
                MOCK_NEW_PLAYER_FIVE,
                MOCK_NEW_PLAYER_SIX,
            ],
        };

        const result = service.startGame(room, MOCK_NEW_PLAYER_ORGANIZER);

        expect(result).toHaveLength(room.players.length);
        expect(room.players[0].playerInGame.startPosition).toBeDefined();
        expect(room.players[1].playerInGame.startPosition).toBeDefined();
        expect(room.players[2].playerInGame.startPosition).toBeDefined();
        expect(room.players[3].playerInGame.startPosition).toBeDefined();
        expect(room.players[4].playerInGame.startPosition).toBeDefined();
        expect(room.players[5].playerInGame.startPosition).toBeDefined();
    });
});
