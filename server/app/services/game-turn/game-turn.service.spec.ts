/* eslint-disable */
import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import {
    MOCK_PLAYERS_DIFFERENT_SPEEDS,
    MOCK_ROOM_GAME,
    MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED,
    MOCK_ROOM_GAME_PLAYER_ABANDONNED,
    MOCK_ROOM_GAME_PLAYER_LAST_STANDING,
    MOCK_TIMER,
} from '@app/constants/test.constants';
import { TimerDuration } from '@app/constants/time.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { RoomGame } from '@app/interfaces/room-game';
import { ActionService } from '@app/services/action/action.service';
import { ErrorMessageService } from '@app/services/error-message/error-message.service';
import { FightManagerService } from '@app/services/fight/fight-manager/fight-manager.service';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { ItemManagerService } from '@app/services/item/item-manager/item-manager.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { TurnInfoService } from '@app/services/turn-info/turn-info.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
import { GameStatus } from '@common/enums/game-status.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameTurnService } from './game-turn.service';
import { PlayerRole } from '@common/enums/player-role.enum';

describe('GameTurnService', () => {
    let service: GameTurnService;
    let server: SinonStubbedInstance<Server>;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let gameTimeService: GameTimeService;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    let gameEndService: SinonStubbedInstance<GameEndService>;
    let virtualStateService: SinonStubbedInstance<VirtualPlayerStateService>;
    let fightManagerService: SinonStubbedInstance<FightManagerService>;
    let actionService: SinonStubbedInstance<ActionService>;
    let itemManagerService: SinonStubbedInstance<ItemManagerService>;
    let errorMessageService: SinonStubbedInstance<ErrorMessageService>;
    beforeEach(async () => {
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        socketManagerService = createStubInstance<SocketManagerService>(SocketManagerService);
        gameEndService = createStubInstance<GameEndService>(GameEndService);
        virtualStateService = createStubInstance<VirtualPlayerStateService>(VirtualPlayerStateService);
        fightManagerService = createStubInstance<FightManagerService>(FightManagerService);
        actionService = createStubInstance<ActionService>(ActionService);
        itemManagerService = createStubInstance<ItemManagerService>(ItemManagerService);
        errorMessageService = createStubInstance<ErrorMessageService>(ErrorMessageService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameTurnService,
                Logger,
                { provide: GameStatsService, useValue: { processTurnStats: jest.fn() } },
                { provide: GameEndService, useValue: gameEndService },
                { provide: RoomManagerService, useValue: roomManagerService },
                { provide: VirtualPlayerStateService, useValue: virtualStateService },
                { provide: FightManagerService, useValue: fightManagerService },
                { provide: ActionService, useValue: actionService },
                { provide: ItemManagerService, useValue: itemManagerService },
                { provide: ErrorMessageService, useValue: errorMessageService },
                {
                    provide: GameTimeService,
                    useValue: {
                        startTimer: jest.fn(),
                        resumeTimer: jest.fn(),
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
                        sendGenericPublicJournal: jest.fn(),
                    },
                },
                {
                    provide: TurnInfoService,
                    useValue: {
                        sendTurnInformation: jest.fn(),
                        updateCurrentPlayerAttributes: jest.fn(),
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
        const mockRoom = MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED as RoomGame;
        mockRoom.game.currentPlayer = 'Player1';
        roomManagerService.getCurrentRoomPlayer.returns(
            mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer),
        );

        const nextPlayer = service['nextTurn'](mockRoom);
        expect(nextPlayer).toBe('Player2');
    });

    it('should wrap around to first player when current player is last in sorted order', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED)) as RoomGame;
        mockRoom.game.currentPlayer = 'Player3';
        mockRoom.players = MOCK_PLAYERS_DIFFERENT_SPEEDS;
        roomManagerService.getCurrentRoomPlayer.returns(
            mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer),
        );
        const nextPlayer = service['nextTurn'](mockRoom);
        expect(nextPlayer).toBe('Player1');
    });

    it('should not set a player turn when that player has abandonned', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_PLAYER_ABANDONNED)) as RoomGame;
        mockRoom.game.currentPlayer = 'Player1';
        roomManagerService.getCurrentRoomPlayer.returns(
            mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer),
        );
        const nextPlayer = service['nextTurn'](mockRoom);
        expect(nextPlayer).toBe('Player3');
    });

    it('should reset player movement and actions on next turn', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_DIFFERENT_PLAYER_SPEED)) as RoomGame;
        const currentPlayer = mockRoom.players.find((p) => p.playerInfo.userName === 'Player1');
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 0;
        mockRoom.game.hasPendingAction = true;
        mockRoom.game.currentPlayer = 'Player1';
        roomManagerService.getCurrentRoomPlayer.returns(
            mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer),
        );
        service['nextTurn'](mockRoom);

        expect(currentPlayer.playerInGame.remainingMovement).toBe(currentPlayer.playerInGame.attributes.speed);
        expect(currentPlayer.playerInGame.remainingActions).toBe(1);
        expect(mockRoom.game.hasPendingAction).toBe(false);
    });

    it('should return null if next player name is the same as current player', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_PLAYER_LAST_STANDING)) as RoomGame;
        const currentPlayer = mockRoom.players.find((p) => p.playerInfo.userName === 'Player1');
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 0;
        mockRoom.game.hasPendingAction = true;
        mockRoom.game.currentPlayer = 'Player1';
        roomManagerService.getCurrentRoomPlayer.returns(
            mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer),
        );
        expect(service['nextTurn'](mockRoom)).toBe(null);
    });

    it('should end the game if game has ended and return', () => {
        const resumeTimerSpy = jest.spyOn(gameTimeService, 'resumeTimer');
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME)) as RoomGame;
        roomManagerService.getCurrentRoomPlayer.returns(
            mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer),
        );
        gameEndService.checkForGameEnd.returns(true);
        const changeTurnSpy = jest.spyOn(service, 'changeTurn').mockImplementation();

        service.handleEndAction(mockRoom);

        expect(resumeTimerSpy).not.toHaveBeenCalled();
        expect(changeTurnSpy).not.toHaveBeenCalled();
    });

    it('should process endAction and update game status from Fight to OverWorld if the game has not ended', () => {
        const resumeTimerSpy = jest.spyOn(gameTimeService, 'resumeTimer');
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME)) as RoomGame;
        mockRoom.game.status = GameStatus.Fight;
        mockRoom.game.currentPlayer = 'Player1';
        roomManagerService.getCurrentRoomPlayer.returns(
            mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer),
        );
        mockRoom.game.hasPendingAction = true;
        const endGameSpy = jest.spyOn(gameEndService, 'endGame').mockImplementation();
        jest.spyOn(service as any, 'isTurnFinished').mockReturnValue(true);
        jest.spyOn(socketManagerService, 'getGatewayServer').mockReturnValue(server);

        service.handleEndAction(mockRoom);

        expect(resumeTimerSpy).toHaveBeenCalledWith(mockRoom.game.timer);
        expect(mockRoom.game.status).toBe(GameStatus.OverWorld);
        expect(mockRoom.game.fight).toBeNull();
        expect(endGameSpy).not.toHaveBeenCalled();
    });

    it('should return true when no actions left and no movement remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 0;
        roomManagerService.getCurrentRoomPlayer.returns(currentPlayer);
        fightManagerService.hasLostFight.returns(false);
        actionService.hasNoPossibleAction.returns(true);
        expect(service['isAnyTurnFinished'](mockRoom)).toBe(true);
    });

    it('should return true when next to no action tiles and no movement remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        mockRoom.game.currentPlayer = 'Player3';
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        currentPlayer.playerInGame.currentPosition = { x: 2, y: 2 };
        currentPlayer.playerInGame.remainingMovement = 0;
        roomManagerService.getCurrentRoomPlayer.returns(currentPlayer);
        fightManagerService.hasLostFight.returns(false);
        actionService.hasNoPossibleAction.returns(true);
        expect(service['isAnyTurnFinished'](mockRoom)).toBe(true);
    });

    it('should return false when next to an ice tile and with no movement remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.zigzag)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        roomManagerService.getCurrentRoomPlayer.returns(currentPlayer);
        currentPlayer.playerInGame.remainingMovement = 0;
        fightManagerService.hasLostFight.returns(false);
        actionService.hasNoPossibleAction.returns(false);
        expect(service['isAnyTurnFinished'](mockRoom)).toBe(false);
    });

    it('should return false when next to an action tile and with no movement remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 1;
        roomManagerService.getCurrentRoomPlayer.returns(currentPlayer);
        fightManagerService.hasLostFight.returns(false);
        actionService.hasNoPossibleAction.returns(false);
        expect(service['isAnyTurnFinished'](mockRoom)).toBe(false);
    });

    it('should return true when no movement remaining and no action remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 0;
        roomManagerService.getCurrentRoomPlayer.returns(currentPlayer);
        fightManagerService.hasLostFight.returns(false);
        actionService.hasNoPossibleAction.returns(true);

        expect(service['isAnyTurnFinished'](mockRoom)).toBe(true);
    });

    it('should return false when actions left but no movement remaining', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        roomManagerService.getCurrentRoomPlayer.returns(currentPlayer);
        currentPlayer.playerInGame.remainingMovement = 0;
        currentPlayer.playerInGame.remainingActions = 1;
        fightManagerService.hasLostFight.returns(false);
        actionService.hasNoPossibleAction.returns(false);
        expect(service['isAnyTurnFinished'](mockRoom)).toBe(false);
    });

    it('should return true when timer is 0 and has pending action', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        roomManagerService.getCurrentRoomPlayer.returns(currentPlayer);
        mockRoom.game.timer.counter = 0;
        mockRoom.game.hasPendingAction = true;
        fightManagerService.hasLostFight.returns(false);

        expect(service['isAnyTurnFinished'](mockRoom)).toBe(true);
    });

    it('should return false when timer is 0 but no pending action', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        roomManagerService.getCurrentRoomPlayer.returns(currentPlayer);
        mockRoom.game.timer.counter = 0;
        mockRoom.game.hasPendingAction = false;
        fightManagerService.hasLostFight.returns(false);

        expect(service['isAnyTurnFinished'](mockRoom)).toBe(false);
    });

    it('should return false when timer is not 0 but has pending action', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        roomManagerService.getCurrentRoomPlayer.returns(currentPlayer);
        mockRoom.game.timer.counter = 1;
        mockRoom.game.hasPendingAction = true;
        fightManagerService.hasLostFight.returns(false);

        expect(service['isAnyTurnFinished'](mockRoom)).toBe(false);
    });

    it('should return when just lost a fight', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const currentPlayer = mockRoom.players.find((player) => player.playerInfo.userName === mockRoom.game.currentPlayer);
        roomManagerService.getCurrentRoomPlayer.returns(currentPlayer);
        mockRoom.game.timer.counter = 1;
        mockRoom.game.hasPendingAction = true;
        fightManagerService.hasLostFight.returns(true);

        expect(service['isAnyTurnFinished'](mockRoom)).toBe(true);
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
        mockRoom.game.virtualState.aiTurnSubject = new Subject();

        jest.useFakeTimers();
        const startTurnSpy = jest.spyOn(service as any, 'startTurn');
        const changeTurnSpy = jest.spyOn(service, 'changeTurn');
        roomManagerService.getPlayerInRoom.returns(mockRoom.players[0]);
        service.remainingTime(mockRoom, time);

        expect(server.to.calledWith('testRoomCode')).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.RemainingTime, time)).toBeTruthy();

        jest.runAllTimers();

        expect(startTurnSpy).toHaveBeenCalled();
        expect(changeTurnSpy).not.toHaveBeenCalled();

        jest.useRealTimers();
    });

    it('should emit RemainingTime and call changeTurn when counter reaches 0 and isTurnChange and isPendingAction are false', () => {
        socketManagerService.getGatewayServer.returns(server);
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const time = 5;
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));
        mockRoom.room.roomCode = 'testRoomCode';
        mockRoom.game.timer.counter = 0;
        mockRoom.game.hasPendingAction = false;
        mockRoom.game.isTurnChange = false;

        jest.useFakeTimers();
        const startTurnSpy = jest.spyOn(service as any, 'startTurn');
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
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME)) as RoomGame;
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));
        mockRoom.game.virtualState.aiTurnSubject = new Subject();
        roomManagerService.getPlayerInRoom.returns(mockRoom.players[0]);
        service['startTurn'](mockRoom);

        expect(gameTimeService.startTimer).toHaveBeenCalledWith(mockRoom.game.timer, TimerDuration.GameTurn);
        expect(server.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.StartTurn, TimerDuration.GameTurn)).toBeTruthy();
    });

    it('should call resumeTurn when isTurnFinished returns false', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.hasPendingAction = true;
        mockRoom.game.isTurnChange = false;
        roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
        jest.spyOn(gameEndService, 'checkForGameEnd').mockReturnValue(false);
        jest.spyOn(service as any, 'isTurnFinished').mockReturnValue(false);
        const resumeTurnSpy = jest.spyOn(service as any, 'resumeTurn').mockImplementation();
        const changeTurnSpy = jest.spyOn(service, 'changeTurn').mockImplementation();

        service.handleEndAction(mockRoom);

        expect(resumeTurnSpy).toHaveBeenCalledWith(mockRoom);
        expect(changeTurnSpy).not.toHaveBeenCalled();
    });

    it('should call sendTurnInformation for human players in resumeTurn', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const humanPlayer = { ...mockRoom.players[0], isVirtual: false };
        roomManagerService.getCurrentRoomPlayer.returns(humanPlayer);
        const turnInfoSpy = jest.spyOn(service['turnInfoService'], 'sendTurnInformation');
        mockRoom.game.virtualState = {
            aiTurnSubject: new Subject(),
            aiTurnSubscription: null,
            isSeekingPlayers: false,
            justExitedFight: false,
            obstacle: null,
        };
        const virtualStateSpy = jest.spyOn(mockRoom.game.virtualState.aiTurnSubject, 'next');

        service['resumeTurn'](mockRoom);

        expect(turnInfoSpy).toHaveBeenCalledWith(mockRoom);
        expect(virtualStateSpy).not.toHaveBeenCalled();
    });

    describe('isTurnFinished', () => {
        it('should call isAITurnFinished for AI players', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            const aiPlayer = { ...mockRoom.players[0], playerInfo: { ...mockRoom.players[0].playerInfo, role: 'virtual' }};
            roomManagerService.getCurrentRoomPlayer.returns(aiPlayer);

            const isAnyTurnFinishedSpy = jest.spyOn(service as any, 'isAnyTurnFinished');
            const isAITurnFinishedSpy = jest.spyOn(service as any, 'isAITurnFinished').mockReturnValue(true);

            const result = service['isTurnFinished'](mockRoom);

            expect(result).toBe(true);
            expect(isAnyTurnFinishedSpy).not.toHaveBeenCalled();
            expect(isAITurnFinishedSpy).toHaveBeenCalledWith(mockRoom);
        });
    });

    describe('AI Turn Handling', () => {
        let mockRoom: RoomGame;
        let aiPlayer;

        beforeEach(() => {
            mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            aiPlayer = {
                ...mockRoom.players[0],
                playerInfo: { ...mockRoom.players[0].playerInfo, role: 'virtual' },
                playerInGame: {
                    ...mockRoom.players[0].playerInGame,
                    remainingMovement: 0,
                }
            };
            roomManagerService.getCurrentRoomPlayer.returns(aiPlayer);
            virtualStateService.isBeforeObstacle = sinon.stub();
            actionService.isNextToActionTile = sinon.stub();
        });

        describe('doesAIHaveUnwantedPossibleAction', () => {
            it('should return true when AI has no movement, is not before obstacle, and is next to action tile', () => {
                virtualStateService.isBeforeObstacle.returns(false);
                actionService.isNextToActionTile.returns(true);
                jest.spyOn(service as any, 'hasNoMovementLeft').mockReturnValue(true);

                const result = service['doesAIHaveUnwantedPossibleAction'](mockRoom);

                expect(result).toBe(true);
                expect(virtualStateService.isBeforeObstacle.calledWith(mockRoom)).toBe(true);
                expect(actionService.isNextToActionTile.calledWith(mockRoom, aiPlayer)).toBe(true);
            });

            it('should return false when AI has movement remaining', () => {
                jest.spyOn(service as any, 'hasNoMovementLeft').mockReturnValue(false);
                virtualStateService.isBeforeObstacle.returns(false);
                actionService.isNextToActionTile.returns(true);

                const result = service['doesAIHaveUnwantedPossibleAction'](mockRoom);

                expect(result).toBe(false);
            });
        });

        describe('isAITurnFinished', () => {
            it('should return true when isAnyTurnFinished is true', () => {
                jest.spyOn(service as any, 'isAnyTurnFinished').mockReturnValue(true);
                jest.spyOn(service as any, 'isAIStuckWithNoActions').mockReturnValue(false);
                jest.spyOn(service as any, 'doesAIHaveUnwantedPossibleAction').mockReturnValue(false);

                const result = service['isAITurnFinished'](mockRoom);

                expect(result).toBe(true);
            });

            it('should return true when AI is stuck with no actions', () => {
                jest.spyOn(service as any, 'isAnyTurnFinished').mockReturnValue(false);
                jest.spyOn(service as any, 'isAIStuckWithNoActions').mockReturnValue(true);
                jest.spyOn(service as any, 'doesAIHaveUnwantedPossibleAction').mockReturnValue(false);

                const result = service['isAITurnFinished'](mockRoom);

                expect(result).toBe(true);
            });
        });
    });

    describe('isAIStuckWithNoActions', () => {
        let mockRoom: RoomGame;
        let aiPlayer;

        beforeEach(() => {
            mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            aiPlayer = {
                ...mockRoom.players[0],
                playerInfo: { ...mockRoom.players[0].playerInfo, role: 'virtual' }
            };
            roomManagerService.getCurrentRoomPlayer.returns(aiPlayer);
            virtualStateService.isBeforeObstacle = sinon.stub();
            actionService.hasNoPossibleAction = sinon.stub();
        });

        it('should return true when AI is before obstacle and has no possible actions', () => {
            virtualStateService.isBeforeObstacle.returns(true);
            actionService.hasNoPossibleAction.returns(true);

            const result = service['isAIStuckWithNoActions'](mockRoom);

            expect(result).toBe(true);
            expect(virtualStateService.isBeforeObstacle.calledWith(mockRoom)).toBe(true);
            expect(actionService.hasNoPossibleAction.calledWith(mockRoom, aiPlayer)).toBe(true);
        });

        it('should return false when AI is before obstacle but has possible actions', () => {
            virtualStateService.isBeforeObstacle.returns(true);
            actionService.hasNoPossibleAction.returns(false);

            const result = service['isAIStuckWithNoActions'](mockRoom);

            expect(result).toBe(false);
            expect(virtualStateService.isBeforeObstacle.calledWith(mockRoom)).toBe(true);
            expect(actionService.hasNoPossibleAction.calledWith(mockRoom, aiPlayer)).toBe(true);
        });

        it('should return false when AI is not before obstacle', () => {
            virtualStateService.isBeforeObstacle.returns(false);
            actionService.hasNoPossibleAction.returns(true);

            const result = service['isAIStuckWithNoActions'](mockRoom);

            expect(result).toBe(false);
            expect(virtualStateService.isBeforeObstacle.calledWith(mockRoom)).toBe(true);
            // Should not check for possible actions if not before obstacle
            expect(actionService.hasNoPossibleAction.called).toBe(false);
        });
    });

    describe('handleTurnChange error handling', () => {
        let mockRoom: RoomGame;

        beforeEach(() => {
            mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            errorMessageService.turnChangeTimerError = sinon.stub();
        });

        it('should handle error when starting turn fails', () => {
            const error = new Error('Start turn error');
            mockRoom.game.isTurnChange = true;
            mockRoom.game.hasPendingAction = false;
            
            jest.spyOn(service as any, 'startTurn').mockImplementation(() => {
                throw error;
            });

            service['handleTurnChange'](mockRoom);

            expect(errorMessageService.turnChangeTimerError.calledWith(error)).toBe(true);
        });

        it('should handle error when changing turn fails', () => {
            const error = new Error('Change turn error');
            mockRoom.game.isTurnChange = false;
            mockRoom.game.hasPendingAction = false;
            
            jest.spyOn(service, 'changeTurn').mockImplementation(() => {
                throw error;
            });

            service['handleTurnChange'](mockRoom);

            expect(errorMessageService.turnChangeTimerError.calledWith(error)).toBe(true);
        });

        it('should not call startTurn or changeTurn when hasPendingAction is true', () => {
            mockRoom.game.hasPendingAction = true;
            const startTurnSpy = jest.spyOn(service as any, 'startTurn');
            const changeTurnSpy = jest.spyOn(service, 'changeTurn');

            service['handleTurnChange'](mockRoom);

            expect(startTurnSpy).not.toHaveBeenCalled();
            expect(changeTurnSpy).not.toHaveBeenCalled();
            expect(errorMessageService.turnChangeTimerError.called).toBe(false);
        });
    });
    describe('isTurnFinished', () => {
        let mockRoom: RoomGame;

        beforeEach(() => {
            mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        });

        describe('human player path', () => {
            beforeEach(() => {
                const humanPlayer = {
                    ...mockRoom.players[0],
                    playerInfo: { ...mockRoom.players[0].playerInfo, role: PlayerRole.Human }
                };
                roomManagerService.getCurrentRoomPlayer.returns(humanPlayer);
            });

            it('should return true when isAnyTurnFinished returns true for human player', () => {
                jest.spyOn(service as any, 'isAnyTurnFinished').mockReturnValue(true);
                jest.spyOn(service as any, 'isAITurnFinished').mockReturnValue(false);

                const result = service['isTurnFinished'](mockRoom);

                expect(result).toBe(true);
                expect(service['isAnyTurnFinished']).toHaveBeenCalledWith(mockRoom);
                expect(service['isAITurnFinished']).not.toHaveBeenCalled();
            });

            it('should return false when isAnyTurnFinished returns false for human player', () => {
                jest.spyOn(service as any, 'isAnyTurnFinished').mockReturnValue(false);
                jest.spyOn(service as any, 'isAITurnFinished').mockReturnValue(true);

                const result = service['isTurnFinished'](mockRoom);

                expect(result).toBe(false);
                expect(service['isAnyTurnFinished']).toHaveBeenCalledWith(mockRoom);
                expect(service['isAITurnFinished']).not.toHaveBeenCalled();
            });
        });

        describe('AI player path', () => {
            beforeEach(() => {
                const aiPlayer = {
                    ...mockRoom.players[0],
                    playerInfo: { ...mockRoom.players[0].playerInfo, role: PlayerRole.AggressiveAI }
                };
                roomManagerService.getCurrentRoomPlayer.returns(aiPlayer);
            });

            it('should return true when isAnyTurnFinished returns true for AI player', () => {
                jest.spyOn(service as any, 'isAnyTurnFinished').mockReturnValue(true);
                jest.spyOn(service as any, 'isAIStuckWithNoActions').mockReturnValue(false);
                jest.spyOn(service as any, 'doesAIHaveUnwantedPossibleAction').mockReturnValue(false);

                const result = service['isTurnFinished'](mockRoom);

                expect(result).toBe(true);
                expect(service['isAnyTurnFinished']).toHaveBeenCalledWith(mockRoom);
                expect(service['isAIStuckWithNoActions']).not.toHaveBeenCalled();
                expect(service['doesAIHaveUnwantedPossibleAction']).not.toHaveBeenCalled();
            });

            it('should return true when isAnyTurnFinished is false but isAIStuckWithNoActions returns true', () => {
                jest.spyOn(service as any, 'isAnyTurnFinished').mockReturnValue(false);
                jest.spyOn(service as any, 'isAIStuckWithNoActions').mockReturnValue(true);
                jest.spyOn(service as any, 'doesAIHaveUnwantedPossibleAction').mockReturnValue(false);

                const result = service['isTurnFinished'](mockRoom);

                expect(result).toBe(true);
                expect(service['isAnyTurnFinished']).toHaveBeenCalledWith(mockRoom);
                expect(service['isAIStuckWithNoActions']).toHaveBeenCalledWith(mockRoom);
                expect(service['doesAIHaveUnwantedPossibleAction']).not.toHaveBeenCalled();
            });

            it('should return true when isAnyTurnFinished and isAIStuckWithNoActions are false but doesAIHaveUnwantedPossibleAction returns true', () => {
                jest.spyOn(service as any, 'isAnyTurnFinished').mockReturnValue(false);
                jest.spyOn(service as any, 'isAIStuckWithNoActions').mockReturnValue(false);
                jest.spyOn(service as any, 'doesAIHaveUnwantedPossibleAction').mockReturnValue(true);

                const result = service['isTurnFinished'](mockRoom);

                expect(result).toBe(true);
                expect(service['isAnyTurnFinished']).toHaveBeenCalledWith(mockRoom);
                expect(service['isAIStuckWithNoActions']).toHaveBeenCalledWith(mockRoom);
                expect(service['doesAIHaveUnwantedPossibleAction']).toHaveBeenCalledWith(mockRoom);
            });

            it('should return false when all conditions return false for AI player', () => {
                jest.spyOn(service as any, 'isAnyTurnFinished').mockReturnValue(false);
                jest.spyOn(service as any, 'isAIStuckWithNoActions').mockReturnValue(false);
                jest.spyOn(service as any, 'doesAIHaveUnwantedPossibleAction').mockReturnValue(false);

                const result = service['isTurnFinished'](mockRoom);

                expect(result).toBe(false);
                expect(service['isAnyTurnFinished']).toHaveBeenCalledWith(mockRoom);
                expect(service['isAIStuckWithNoActions']).toHaveBeenCalledWith(mockRoom);
                expect(service['doesAIHaveUnwantedPossibleAction']).toHaveBeenCalledWith(mockRoom);
            });
        });
    });
});
