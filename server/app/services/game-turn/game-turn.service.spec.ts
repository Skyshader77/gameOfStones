import { MOCK_ROOM_COMBAT_ABANDONNED } from '@app/constants/combat.test.constants';
import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import {
    MOCK_PLAYERS_DIFFERENT_SPEEDS,
    MOCK_ROOM_GAME,
    MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED,
    MOCK_ROOM_GAME_PLAYER_ABANDONNED,
    MOCK_ROOM_GAME_PLAYER_LAST_STANDING,
    MOCK_TIMER,
} from '@app/constants/test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameTurnService } from './game-turn.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { Server } from 'socket.io';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { TimerDuration } from '@app/constants/time.constants';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { TurnInfoService } from '@app/services/turn-info/turn-info.service';

describe('GameTurnService', () => {
    let service: GameTurnService;
    let server: SinonStubbedInstance<Server>;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let gameTimeService: GameTimeService;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    beforeEach(async () => {
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        socketManagerService = createStubInstance<SocketManagerService>(SocketManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameTurnService,
                Logger,
                { provide: GameStatsService, useValue: { processTurnStats: jest.fn() } },
                { provide: RoomManagerService, useValue: roomManagerService },
                {
                    provide: GameTimeService,
                    useValue: {
                        startTimer: jest.fn(),
                    },
                },
                {
                    provide: PlayerMovementService,
                    useValue: {
                        getReachableTiles: jest.fn(),
                        emitReachableTiles: jest.fn(),
                    },
                },
                {
                    provide: MessagingGateway,
                    useValue: {
                        sendPublicJournal: jest.fn(),
                    },
                },
                {
                    provide: TurnInfoService,
                    useValue: {
                        sendTurnInformation: jest.fn(),
                    },
                },
                SocketManagerService,
                {
                    provide: SocketManagerService,
                    useValue: socketManagerService,
                },
            ],
        }).compile();
        gameTimeService = module.get(GameTimeService);
        service = module.get<GameTurnService>(GameTurnService);
        server = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
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

    it('should emit RemainingTime and handle turn change or turn continuation when counter reaches 0', () => {
        socketManagerService.getGatewayServer.returns(server);
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const time = 5;
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));
        mockRoom.room.roomCode = 'testRoomCode';
        mockRoom.game.timer.counter = 0;
        mockRoom.game.hasPendingAction = false;
        mockRoom.game.isTurnChange = true;

        jest.useFakeTimers();
        const startTurnSpy = jest.spyOn(service, 'startTurn');
        const changeTurnSpy = jest.spyOn(service, 'changeTurn');

        service.remainingTime(mockRoom, time);

        expect(server.to.calledWith('testRoomCode')).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.RemainingTime, time)).toBeTruthy();

        jest.runAllTimers();

        expect(startTurnSpy).toHaveBeenCalled();
        expect(changeTurnSpy).not.toHaveBeenCalled();

        jest.useRealTimers();
    });

    it('should emit RemainingTime and call changeTurn when counter reaches 0 and isTurnChange is false', () => {
        socketManagerService.getGatewayServer.returns(server);
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const time = 5;
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));
        mockRoom.room.roomCode = 'testRoomCode';
        mockRoom.game.timer.counter = 0;
        mockRoom.game.hasPendingAction = false;
        mockRoom.game.isTurnChange = false;

        jest.useFakeTimers();
        const startTurnSpy = jest.spyOn(service, 'startTurn');
        const changeTurnSpy = jest.spyOn(service, 'changeTurn');
        roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);

        service.remainingTime(mockRoom, time);

        expect(server.to.calledWith('testRoomCode')).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.RemainingTime, time)).toBeTruthy();

        jest.runAllTimers();

        expect(changeTurnSpy).toHaveBeenCalled();
        expect(startTurnSpy).not.toHaveBeenCalled();

        jest.useRealTimers();
    });

    it('should start the turn by emitting reachable tiles, starting the timer, and emitting StartTurn event', () => {
        socketManagerService.getGatewayServer.returns(server);
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));

        service.startTurn(mockRoom);

        expect(gameTimeService.startTimer).toHaveBeenCalledWith(mockRoom.game.timer, TimerDuration.GameTurn);
        expect(server.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.StartTurn, TimerDuration.GameTurn)).toBeTruthy();
    });
});
