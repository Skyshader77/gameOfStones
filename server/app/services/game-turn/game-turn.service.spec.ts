import {
    MOCK_PLAYERS_DIFFERENT_SPEEDS,
    MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED,
    MOCK_ROOM_GAME_PLAYER_ABANDONNED,
} from '@app/constants/test.constants';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameTurnService } from './game-turn.service';

describe('GameTurnService', () => {
    let service: GameTurnService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameTurnService, Logger],
        }).compile();
        service = module.get<GameTurnService>(GameTurnService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should set next player as active player when not at end of list', () => {
        const game = MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED;
        game.game.currentPlayer = 'Player1';

        const nextPlayer = service.nextTurn(game);
        expect(nextPlayer).toBe('Player2');
    });

    it('should wrap around to first player when current player is last in sorted order', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED));
        mockRoom.game.currentPlayer = 'Player3';
        mockRoom.players = MOCK_PLAYERS_DIFFERENT_SPEEDS;
        const nextPlayer = service.nextTurn(mockRoom);
        expect(nextPlayer).toBe('Player1');
    });

    it('should not set a player turn when that player has abandonned', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_PLAYER_ABANDONNED));
        mockRoom.game.currentPlayer = 'Player1';
        const nextPlayer = service.nextTurn(mockRoom);
        expect(nextPlayer).toBe('Player3');
    });

    it('should reset player movement and actions on next turn', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED));
        const currentPlayer = mockRoom.players.find((p) => p.playerInfo.userName === 'Player1');
        currentPlayer.playerInGame.remainingMovement = 0;
        mockRoom.game.actionsLeft = 0;
        mockRoom.game.hasPendingAction = true;
        mockRoom.game.currentPlayer = 'Player1';

        service.nextTurn(mockRoom);

        expect(currentPlayer.playerInGame.remainingMovement).toBe(currentPlayer.playerInGame.movementSpeed);
        expect(mockRoom.game.actionsLeft).toBe(1);
        expect(mockRoom.game.hasPendingAction).toBe(false);
    });
});
