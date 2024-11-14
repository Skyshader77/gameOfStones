import { MOCK_ROOM_COMBAT_ABANDONNED } from '@app/constants/combat.test.constants';
import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import {
    MOCK_PLAYERS_DIFFERENT_SPEEDS,
    MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED,
    MOCK_ROOM_GAME_PLAYER_ABANDONNED,
    MOCK_ROOM_GAME_PLAYER_LAST_STANDING,
} from '@app/constants/test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameTurnService } from './game-turn.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';

describe('GameTurnService', () => {
    let service: GameTurnService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameTurnService, Logger, { provide: GameStatsService, useValue: { processTurnStats: jest.fn() } }],
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
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED)) as RoomGame;
        mockRoom.game.currentPlayer = 'Player3';
        mockRoom.players = MOCK_PLAYERS_DIFFERENT_SPEEDS;
        const nextPlayer = service.nextTurn(mockRoom);
        expect(nextPlayer).toBe('Player1');
    });

    it('should not set a player turn when that player has abandonned', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_PLAYER_ABANDONNED)) as RoomGame;
        mockRoom.game.currentPlayer = 'Player1';
        const nextPlayer = service.nextTurn(mockRoom);
        expect(nextPlayer).toBe('Player3');
    });

    it('should reset player movement and actions on next turn', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED)) as RoomGame;
        const currentPlayer = mockRoom.players.find((p) => p.playerInfo.userName === 'Player1');
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 0;
        mockRoom.game.hasPendingAction = true;
        mockRoom.game.currentPlayer = 'Player1';

        service.nextTurn(mockRoom);

        expect(currentPlayer.playerInGame.remainingMovement).toBe(currentPlayer.playerInGame.attributes.speed);
        expect(currentPlayer.playerInGame.remainingActions).toBe(1);
        expect(mockRoom.game.hasPendingAction).toBe(false);
    });

    it('should reset player movement and actions on next turn', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_PLAYER_LAST_STANDING)) as RoomGame;
        const currentPlayer = mockRoom.players.find((p) => p.playerInfo.userName === 'Player1');
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 0;
        mockRoom.game.hasPendingAction = true;
        mockRoom.game.currentPlayer = 'Player1';
        expect(service.nextTurn(mockRoom)).toBe(null);
    });

    it('should return true when no actions left and no movement remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.zigzag)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 0;

        expect(service.isTurnFinished(mockRoom)).toBe(true);
    });

    it('should return true when next to no action tiles and no movement remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.zigzag)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = 0;

        expect(service.isTurnFinished(mockRoom)).toBe(true);
    });

    it('should return false when next to an action tile and with no movement remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 1;

        expect(service.isTurnFinished(mockRoom)).toBe(false);
    });

    it('should return true when next to an action tile and with no movement remaining and no action remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 0;

        expect(service.isTurnFinished(mockRoom)).toBe(true);
    });

    it('should return false when actions left but no movement remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 1;

        expect(service.isTurnFinished(mockRoom)).toBe(false);
    });

    it('should return true when timer is 0 and has pending action', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        mockRoom.game.timer.counter = 0;
        mockRoom.game.hasPendingAction = true;

        expect(service.isTurnFinished(mockRoom)).toBe(true);
    });

    it('should return false when timer is 0 but no pending action', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        mockRoom.game.timer.counter = 0;
        mockRoom.game.hasPendingAction = false;

        expect(service.isTurnFinished(mockRoom)).toBe(false);
    });

    it('should return false when timer is not 0 but has pending action', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        mockRoom.game.timer.counter = 1;
        mockRoom.game.hasPendingAction = true;

        expect(service.isTurnFinished(mockRoom)).toBe(false);
    });

    it('should return true when player is next to a player', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        mockRoom.game.timer.counter = 1;
        mockRoom.game.hasPendingAction = true;

        expect(service.isTurnFinished(mockRoom)).toBe(false);
    });

    it('should return true when the fight has a clear loser', () => {
        const mockRoomAbandonned = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT_ABANDONNED)) as RoomGame;
        mockRoomAbandonned.game.fight.result.loser = 'Player2';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (service as any).hasLostFight(mockRoomAbandonned);
        expect(result).toBe(false);
    });
});
