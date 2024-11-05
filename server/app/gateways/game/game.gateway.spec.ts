/* eslint-disable max-lines */
import { MOCK_ROOM_COMBAT } from '@app/constants/combat.test.constants';
import { MOCK_PLAYER_STARTS_TESTS } from '@app/constants/gameplay.test.constants';
import { MOCK_MOVEMENT, MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import {
    MOCK_GAME_END_NOTHING_OUTPUT,
    MOCK_FIGHT,
    MOCK_PLAYERS,
    MOCK_ROOM,
    MOCK_ROOM_GAME,
    MOCK_ROOM_GAME_PLAYER_ABANDONNED,
    MOCK_ROOM_GAME_W_DOORS,
    MOCK_TIMER,
    MOCK_GAME_END_WINNING_OUTPUT,
} from '@app/constants/test.constants';
import { TimerDuration } from '@app/constants/time.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { FightLogicService } from '@app/services/fight/fight/fight-logic.service';
import { FightManagerService } from '@app/services/fight/fight/fight-manager.service';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { PlayerAbandonService } from '@app/services/player-abandon/player-abandon.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { GameStatus } from '@common/enums/game-status.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Fight } from '@common/interfaces/fight';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable, Subscription } from 'rxjs';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameGateway } from './game.gateway';
import { TURN_CHANGE_DELAY_MS } from './game.gateway.constants';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let movementService: SinonStubbedInstance<PlayerMovementService>;
    let gameTimeService: SinonStubbedInstance<GameTimeService>;
    let doorService: SinonStubbedInstance<DoorOpeningService>;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    let gameTurnService: SinonStubbedInstance<GameTurnService>;
    let gameStartService: SinonStubbedInstance<GameStartService>;
    let gameEndService: SinonStubbedInstance<GameEndService>;
    let fightService: SinonStubbedInstance<FightLogicService>;
    let playerAbandonService: SinonStubbedInstance<PlayerAbandonService>;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let gameMessagingGateway: SinonStubbedInstance<MessagingGateway>;
    let fightManagerService: SinonStubbedInstance<FightManagerService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let logger: SinonStubbedInstance<Logger>;
    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        socket.data = {};
        movementService = createStubInstance<PlayerMovementService>(PlayerMovementService);
        gameTimeService = createStubInstance<GameTimeService>(GameTimeService);
        doorService = createStubInstance<DoorOpeningService>(DoorOpeningService);
        socketManagerService = createStubInstance<SocketManagerService>(SocketManagerService);
        gameTurnService = createStubInstance<GameTurnService>(GameTurnService);
        gameStartService = createStubInstance<GameStartService>(GameStartService);
        playerAbandonService = createStubInstance<PlayerAbandonService>(PlayerAbandonService);
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        gameEndService = createStubInstance<GameEndService>(GameEndService);
        gameMessagingGateway = createStubInstance<MessagingGateway>(MessagingGateway);
        fightManagerService = createStubInstance<FightManagerService>(FightManagerService);
        fightService = createStubInstance<FightLogicService>(FightLogicService);
        server = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
        stub(socket, 'rooms').value(MOCK_ROOM);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                { provide: PlayerMovementService, useValue: movementService },
                { provide: GameTimeService, useValue: gameTimeService },
                { provide: DoorOpeningService, useValue: doorService },
                { provide: SocketManagerService, useValue: socketManagerService },
                { provide: GameTurnService, useValue: gameTurnService },
                { provide: GameStartService, useValue: gameStartService },
                {
                    provide: Logger,
                    useValue: logger,
                },
                { provide: PlayerAbandonService, useValue: playerAbandonService },
                { provide: RoomManagerService, useValue: roomManagerService },
                { provide: GameEndService, useValue: gameEndService },
                { provide: FightLogicService, useValue: fightService },
                { provide: MessagingGateway, useValue: gameMessagingGateway },
                { provide: FightManagerService, useValue: fightManagerService },
            ],
        }).compile();
        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should process player movement and emit PlayerMove event', () => {
        gateway.emitReachableTiles = jest.fn();
        socketManagerService.getSocketPlayerName.returns('Player1');
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME);
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM_GAME.room.roomCode);
        movementService.processPlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);

        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.calledWith(MOCK_ROOM_GAME.room.roomCode)).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerMove, MOCK_MOVEMENT.moveResults.normal)).toBeTruthy();
        expect(gateway.emitReachableTiles).toBeCalled();
    });

    it('should start the game and emit StartGame event with the correct game information', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        socketManagerService.getSocketRoom.returns(mockRoom);
        socketManagerService.getSocketPlayerName.returns('Player1');
        gameStartService.startGame.returns(MOCK_PLAYER_STARTS_TESTS);
        gameTimeService.getInitialTimer.returns(MOCK_TIMER);
        const mockSubscription = { subscribe: stub() };
        gameTimeService.getTimerSubject.returns(mockSubscription as unknown as Observable<number>);
        socketManagerService.getPlayerSocket.returns(socket);

        const remainingTimeSpy = jest.spyOn(gateway, 'remainingTime');

        gateway.startGame(socket);

        expect(server.to.calledWith(MOCK_ROOM_GAME.room.roomCode)).toBeTruthy();
        expect(gameTimeService.getTimerSubject.called).toBeTruthy();
        expect(socketManagerService.getSocketRoom.calledWith(socket)).toBeTruthy();
        expect(gameStartService.startGame.calledWith(mockRoom, MOCK_PLAYERS[0])).toBeTruthy();

        const counterValue = 10;
        mockSubscription.subscribe.getCall(0).args[0](counterValue);

        expect(remainingTimeSpy).toHaveBeenCalledWith(mockRoom, counterValue);
    });

    it('should not process player movement if it is not the current player', () => {
        gateway.emitReachableTiles = jest.fn();
        socketManagerService.getSocketPlayerName.returns('Player2');
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME);
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        movementService.processPlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);

        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.called).toBeFalsy();
        expect(gateway.emitReachableTiles).not.toBeCalled();
    });

    it('should not process player movement if the room and player do not exist', () => {
        gateway.emitReachableTiles = jest.fn();
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.calledWith(GameEvents.PlayerMove, MOCK_MOVEMENT.moveResults.normal)).toBeFalsy();
        expect(gateway.emitReachableTiles).not.toBeCalled();
    });

    it('should emit PlayerSlipped event if the player has tripped', () => {
        gateway.emitReachableTiles = jest.fn();
        movementService.processPlayerMovement.returns(MOCK_MOVEMENT.moveResults.tripped);
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME);
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM_GAME.room.roomCode);
        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.calledWith(MOCK_ROOM_GAME.room.roomCode)).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerSlipped, 'Player1')).toBeTruthy();
    });

    it('should not emit PlayerSlipped event if the player has not tripped', () => {
        gateway.emitReachableTiles = jest.fn();
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME);
        movementService.processPlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM_GAME.room.roomCode);
        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.emit.neverCalledWith(GameEvents.PlayerSlipped, 'Player1')).toBeTruthy();
        expect(gateway.emitReachableTiles).toBeCalled();
    });

    it('should process desired Door movement and emit PlayerDoor event for opening a door', () => {
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_W_DOORS.players[0]));
        gateway.emitReachableTiles = jest.fn();
        gateway.endAction = jest.fn();

        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendPublicJournal');

        roomManagerService.getCurrentRoomPlayer.returns(mockPlayer);
        socketManagerService.getSocketPlayerName.returns(mockPlayer.playerInfo.userName);
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_W_DOORS);
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM_GAME_W_DOORS.room.roomCode);

        doorService.toggleDoor.returns(TileTerrain.OpenDoor);
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });

        expect(server.to.calledWith(MOCK_ROOM_GAME_W_DOORS.room.roomCode)).toBeTruthy();
        expect(gateway.emitReachableTiles).toHaveBeenCalled();
        expect(
            server.emit.calledWith(GameEvents.PlayerDoor, { updatedTileTerrain: TileTerrain.OpenDoor, doorPosition: { x: 0, y: 0 } }),
        ).toBeTruthy();
        expect(sendPublicJournalSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_W_DOORS, JournalEntry.DoorOpen);
    });

    it('should process desired Door movement and emit PlayerDoor event for closing a door', () => {
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_W_DOORS.players[0]));
        gateway.emitReachableTiles = jest.fn();
        gateway.endAction = jest.fn();

        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendPublicJournal');

        roomManagerService.getCurrentRoomPlayer.returns(mockPlayer);
        socketManagerService.getSocketPlayerName.returns(mockPlayer.playerInfo.userName);
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_W_DOORS);
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM_GAME_W_DOORS.room.roomCode);

        doorService.toggleDoor.returns(TileTerrain.ClosedDoor);
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });

        expect(server.to.calledWith(MOCK_ROOM_GAME_W_DOORS.room.roomCode)).toBeTruthy();
        expect(gateway.emitReachableTiles).toHaveBeenCalled();
        expect(
            server.emit.calledWith(GameEvents.PlayerDoor, { updatedTileTerrain: TileTerrain.ClosedDoor, doorPosition: { x: 0, y: 0 } }),
        ).toBeTruthy();
        expect(sendPublicJournalSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_W_DOORS, JournalEntry.DoorClose);
    });

    it('should not process door action if room or playerName is missing', () => {
        const emitSpy = jest.spyOn(server, 'to');
        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendPublicJournal');
        const emitReachableTilesSpy = jest.spyOn(gateway, 'emitReachableTiles');

        socketManagerService.getSocketRoom.returns(undefined);
        socketManagerService.getSocketPlayerName.returns('Player1');

        gateway.processDesiredDoor(socket, { x: 1, y: 1 });

        expect(emitSpy).not.toHaveBeenCalled();
        expect(sendPublicJournalSpy).not.toHaveBeenCalled();
        expect(emitReachableTilesSpy).not.toHaveBeenCalled();

        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME);
        socketManagerService.getSocketPlayerName.returns(undefined);

        gateway.processDesiredDoor(socket, { x: 1, y: 1 });

        expect(emitSpy).not.toHaveBeenCalled();
        expect(sendPublicJournalSpy).not.toHaveBeenCalled();
        expect(emitReachableTilesSpy).not.toHaveBeenCalled();
    });

    it('should not process desired Door movement if it is not the current player', () => {
        doorService.toggleDoor.returns(TileTerrain.ClosedDoor);
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME_W_DOORS);
        socketManagerService.getSocketPlayerName.returns('Player2');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_W_DOORS);
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });
        expect(server.to.called).toBeFalsy();
        expect(
            server.emit.calledWith(GameEvents.PlayerDoor, { updatedTileTerrain: TileTerrain.ClosedDoor, doorPosition: { x: 0, y: 0 } }),
        ).toBeFalsy();
    });

    it('should not process desired Door movement if the room and player do not exist', () => {
        doorService.toggleDoor.returns(TileTerrain.ClosedDoor);
        socketManagerService.getSocketPlayerName.returns('Player5');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_W_DOORS);
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });
        expect(server.to.called).toBeFalsy();
        expect(
            server.emit.calledWith(GameEvents.PlayerDoor, { updatedTileTerrain: TileTerrain.ClosedDoor, doorPosition: { x: 0, y: 0 } }),
        ).toBeFalsy();
    });

    it('should process endTurn and emit ChangeTurn event', () => {
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
        const clock = sinon.useFakeTimers();
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME);
        gameTurnService.nextTurn.returns('Player2');
        gameEndService.hasGameEnded.returns(MOCK_GAME_END_NOTHING_OUTPUT);
        gateway.endTurn(socket);
        clock.tick(TURN_CHANGE_DELAY_MS);
        expect(changeTurnSpy).toHaveBeenCalled();
        clock.restore();
    });

    it('should not process endTurn if it is not the current player', () => {
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
        const clock = sinon.useFakeTimers();
        socketManagerService.getSocketPlayerName.returns('Player2');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME);
        gateway.endTurn(socket);
        clock.tick(TURN_CHANGE_DELAY_MS);
        expect(changeTurnSpy).not.toHaveBeenCalled();
        clock.restore();
    });

    it('should not process player movement if the room and player do not exist', () => {
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
        const clock = sinon.useFakeTimers();
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.endTurn(socket);
        clock.tick(TURN_CHANGE_DELAY_MS);
        expect(changeTurnSpy).not.toHaveBeenCalled();
        clock.restore();
    });

    it('should not process endAction if it is not the current player', () => {
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
        socketManagerService.getSocketPlayerName.returns('Player2');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME);
        gateway.endAction(socket);
        expect(changeTurnSpy).not.toHaveBeenCalled();
    });

    it('should not process player movement if the room and player do not exist', () => {
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.endAction(socket);
        expect(changeTurnSpy).not.toHaveBeenCalled();
    });

    it('should process endAction, update game status from Fight to OverWorld, and end the game if game has ended', () => {
        const resumeTimerSpy = jest.spyOn(gameTimeService, 'resumeTimer');
        const endGameSpy = jest.spyOn(gateway, 'endGame').mockImplementation();
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.status = GameStatus.Fight;
        mockRoom.game.currentPlayer = 'Player1';
        gameEndService.hasGameEnded.returns(MOCK_GAME_END_WINNING_OUTPUT);
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoom.returns(mockRoom);

        gateway.endAction(socket);

        expect(resumeTimerSpy).toHaveBeenCalledWith(mockRoom.game.timer);
        expect(mockRoom.game.status).toBe(GameStatus.OverWorld);
        expect(mockRoom.game.fight).toBeNull();
        expect(endGameSpy).toHaveBeenCalledWith(mockRoom, MOCK_GAME_END_WINNING_OUTPUT);
    });

    it('should process endTurn and emit ChangeTurn event', () => {
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME);
        gameEndService.hasGameEnded.returns(MOCK_GAME_END_NOTHING_OUTPUT);
        gameTurnService.isTurnFinished.returns(true);
        gateway.endAction(socket);
        expect(changeTurnSpy).toHaveBeenCalled();
    });

    it('should process player abandonment and handle fighter abandonment if player is in fight', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const playerName = 'Player1';
        socketManagerService.getSocketRoom.returns(mockRoom);
        socketManagerService.getSocketPlayerName.returns(playerName);
        playerAbandonService.processPlayerAbandonment.returns(true);
        fightManagerService.isInFight.returns(true);

        const processFighterAbandonmentSpy = jest.spyOn(fightManagerService, 'processFighterAbandonment');
        const fightEndSpy = jest.spyOn(fightManagerService, 'fightEnd');

        gateway.processPlayerAbandonment(socket);

        expect(processFighterAbandonmentSpy).toHaveBeenCalledWith(mockRoom, playerName);
        expect(fightEndSpy).toHaveBeenCalledWith(mockRoom, server);
    });

    it('should process player abandonment and change turn if current player has abandoned', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const playerName = 'Player1';
        socketManagerService.getSocketRoom.returns(mockRoom);
        socketManagerService.getSocketPlayerName.returns(playerName);
        playerAbandonService.processPlayerAbandonment.returns(true);
        playerAbandonService.hasCurrentPlayerAbandoned.returns(true);

        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
        const emitSpy = jest.spyOn(server, 'to');

        gateway.processPlayerAbandonment(socket);

        expect(emitSpy).toHaveBeenCalledWith(mockRoom.room.roomCode);
        expect(changeTurnSpy).toHaveBeenCalledWith(mockRoom);
    });

    it('should emit PlayerAbandoned event and call gameCleanup when all but one player has abandoned', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const playerName = 'Player1';

        const sendAbandonJournalSpy = jest.spyOn(gameMessagingGateway, 'sendAbandonJournal');
        const processPlayerAbandonmentSpy = jest.spyOn(playerAbandonService, 'processPlayerAbandonment').mockReturnValue(true);
        const isInFightSpy = jest.spyOn(fightManagerService, 'isInFight').mockReturnValue(false);
        const haveAllButOnePlayerAbandonedSpy = jest.spyOn(gameEndService, 'haveAllButOnePlayerAbandoned').mockReturnValue(true);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gameCleanupSpy = jest.spyOn(gateway as any, 'gameCleanup').mockImplementation();
        gateway.handlePlayerAbandonment(mockRoom, playerName);

        expect(sendAbandonJournalSpy).toHaveBeenCalledWith(mockRoom, playerName);
        expect(processPlayerAbandonmentSpy).toHaveBeenCalled();
        expect(isInFightSpy).toHaveBeenCalledWith(mockRoom, playerName);
        expect(haveAllButOnePlayerAbandonedSpy).toHaveBeenCalledWith(mockRoom.players);
        expect(server.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerAbandoned, playerName)).toBeTruthy();
        expect(gameCleanupSpy).toHaveBeenCalledWith(mockRoom);
    });

    it('should not do abandon a player if there is no room or player name', () => {
        socketManagerService.getSocketRoom.returns(undefined);
        socketManagerService.getSocketPlayerName.returns(undefined);
        gateway.processPlayerAbandonment(socket);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.called).toBeFalsy();
    });

    it('should not do abandon a player if playerAbandonment returns false', () => {
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_PLAYER_ABANDONNED);
        socketManagerService.getSocketPlayerName.returns('Player1');
        playerAbandonService.processPlayerAbandonment.returns(false);

        gateway.processPlayerAbandonment(socket);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.called).toBeFalsy();
    });

    it('should process desired Fight and emit EndGame event', () => {
        const startFightSpy = jest.spyOn(fightManagerService, 'startFight');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_COMBAT);
        socketManagerService.getSocketPlayerName.returns('Player1');

        gateway.processDesiredFight(socket, 'Player2');

        expect(startFightSpy).toBeCalled();
    });

    it('should not process start fight if it is not the current player', () => {
        const startFightSpy = jest.spyOn(fightManagerService, 'startFight');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_COMBAT);
        socketManagerService.getSocketPlayerName.returns('Player2');

        gateway.processDesiredFight(socket, 'Player1');

        expect(startFightSpy).not.toBeCalled();
    });

    it('should not process start fight if the room and player do not exist', () => {
        const startFightSpy = jest.spyOn(fightManagerService, 'startFight');
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.processDesiredFight(socket, 'Player1');
        expect(startFightSpy).not.toBeCalled();
    });

    it('should process Desired Attack', () => {
        const attackSpy = jest.spyOn(fightManagerService, 'fighterAttack');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_COMBAT);
        socketManagerService.getSocketPlayerName.returns('Player1');

        fightService.isCurrentFighter.returns(true);

        gateway.processDesiredAttack(socket);

        expect(attackSpy).toBeCalled();
    });

    it('should process not process Desired Attack if is not the current fighter', () => {
        const attackSpy = jest.spyOn(fightManagerService, 'fighterAttack');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_COMBAT);
        socketManagerService.getSocketPlayerName.returns('Player1');

        fightService.isCurrentFighter.returns(false);

        gateway.processDesiredAttack(socket);

        expect(attackSpy).not.toBeCalled();
    });

    it('should not process Desired Attack if the room and player do not exist', () => {
        const attackSpy = jest.spyOn(fightManagerService, 'fighterAttack');
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.processDesiredAttack(socket);
        expect(attackSpy).not.toBeCalled();
    });

    it('should process Desired Evade', () => {
        const evadeSpy = jest.spyOn(fightManagerService, 'fighterEscape');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_COMBAT);
        socketManagerService.getSocketPlayerName.returns('Player1');

        fightService.isCurrentFighter.returns(true);
        gateway.processDesiredEvade(socket);
        expect(evadeSpy).toBeCalled();
    });

    it('should process desired evade and emit reachable tiles if the fight is finished', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const playerName = 'Player1';
        socketManagerService.getSocketRoom.returns(mockRoom);
        socketManagerService.getSocketPlayerName.returns(playerName);

        mockRoom.game.fight = { isFinished: true } as unknown as Fight;
        fightService.isCurrentFighter.returns(true);

        const fighterEscapeSpy = jest.spyOn(fightManagerService, 'fighterEscape');
        const emitReachableTilesSpy = jest.spyOn(gateway, 'emitReachableTiles');

        gateway.processDesiredEvade(socket);

        expect(fighterEscapeSpy).toHaveBeenCalledWith(mockRoom);
        expect(emitReachableTilesSpy).toHaveBeenCalledWith(mockRoom);
    });

    it('should not process Desired Evade if is not the current fighter', () => {
        const evadeSpy = jest.spyOn(fightManagerService, 'fighterEscape');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_COMBAT);
        socketManagerService.getSocketPlayerName.returns('Player1');

        fightService.isCurrentFighter.returns(false);
        gateway.processDesiredEvade(socket);
        expect(evadeSpy).not.toBeCalled();
    });

    it('should not process Desired Evade if the room and player do not exist', () => {
        const evadeSpy = jest.spyOn(fightManagerService, 'fighterEscape');
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.processDesiredEvade(socket);
        expect(evadeSpy).not.toBeCalled();
    });

    it('should not process  EndFight Action if the room and player do not exist', () => {
        const startFightSpy = jest.spyOn(fightManagerService, 'startFight');
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.processDesiredAttack(socket);
        expect(startFightSpy).not.toBeCalled();
    });

    it('should reset loser’s position and HP for each fighter when the fight is finished, and emit reachable tiles for the winner', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const mockFight = JSON.parse(JSON.stringify(MOCK_FIGHT));

        mockFight.isFinished = true;
        mockFight.result = { winner: 'Player1', loser: 'Player2', respawnPosition: { x: 0, y: 0 } };
        mockRoom.game.fight = mockFight;

        socketManagerService.getSocketRoom.returns(mockRoom);
        socketManagerService.getSocketPlayerName.returns('Player1');
        roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
        fightService.isCurrentFighter.returns(true);

        const fightEndSpy = jest.spyOn(fightManagerService, 'fightEnd').mockImplementation();
        const emitReachableTilesSpy = jest.spyOn(gateway, 'emitReachableTiles').mockImplementation();

        gateway.processEndFightAction(socket);

        const loser = mockRoom.players.find((player) => player.playerInfo.userName === 'Player2');
        expect(loser?.playerInGame.currentPosition).toEqual(loser?.playerInGame.startPosition);

        mockRoom.game.fight.fighters.forEach((fighter) => {
            expect(fighter.playerInGame.remainingHp).toBe(fighter.playerInGame.attributes.hp);
        });

        expect(emitReachableTilesSpy).toHaveBeenCalledWith(mockRoom);
        expect(fightEndSpy).toHaveBeenCalledWith(mockRoom, expect.anything());
    });

    it('should return early when there is no room or no player', () => {
        socketManagerService.getSocketRoom.returns(undefined);
        socketManagerService.getSocketPlayerName.returns(undefined);

        const fightEndSpy = jest.spyOn(fightManagerService, 'fightEnd');
        const emitReachableTilesSpy = jest.spyOn(gateway, 'emitReachableTiles');
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
        const startFightTurnSpy = jest.spyOn(fightManagerService, 'startFightTurn');

        gateway.processEndFightAction(socket);

        expect(fightEndSpy).not.toHaveBeenCalled();
        expect(emitReachableTilesSpy).not.toHaveBeenCalled();
        expect(changeTurnSpy).not.toHaveBeenCalled();
        expect(startFightTurnSpy).not.toHaveBeenCalled();
    });

    it('should call changeTurn when the current player is the loser', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const mockFight = JSON.parse(JSON.stringify(MOCK_FIGHT));
        mockFight.isFinished = true;
        mockFight.result = { winner: 'Player2', loser: 'Player1', respawnPosition: { x: 0, y: 0 } };
        mockRoom.game.fight = mockFight;

        socketManagerService.getSocketRoom.returns(mockRoom);
        socketManagerService.getSocketPlayerName.returns('Player1');
        roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
        fightService.isCurrentFighter.returns(true);

        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');

        gateway.processEndFightAction(socket);

        expect(changeTurnSpy).toHaveBeenCalledWith(mockRoom);
    });

    it('should start a new fight turn if the fight is not finished', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const mockFight = JSON.parse(JSON.stringify(MOCK_FIGHT));
        mockFight.isFinished = false;
        mockRoom.game.fight = mockFight;

        socketManagerService.getSocketRoom.returns(mockRoom);
        socketManagerService.getSocketPlayerName.returns('Player1');
        fightService.isCurrentFighter.returns(true);

        const startFightTurnSpy = jest.spyOn(fightManagerService, 'startFightTurn');

        gateway.processEndFightAction(socket);

        expect(startFightTurnSpy).toHaveBeenCalledWith(mockRoom);
    });

    /* it('should emit EndGame and LastStanding events to the last player', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendPublicJournal');
        const stopTimerSpy = jest.spyOn(gameTimeService, 'stopTimer');
        const deleteRoomSpy = jest.spyOn(roomManagerService, 'deleteRoom');
        const socketSpy = jest.spyOn(socket, 'emit');
        socketManagerService.getPlayerSocket.returns(socket);

        gateway.lastStanding(mockRoom);

        expect(sendPublicJournalSpy).toHaveBeenCalledWith(mockRoom, JournalEntry.GameEnd);
        expect(stopTimerSpy).toHaveBeenCalledWith(mockRoom.game.timer);
        expect(deleteRoomSpy).toHaveBeenCalledWith(mockRoom.room.roomCode);

        expect(socketSpy).toHaveBeenCalledWith(GameEvents.LastStanding);
    });

    it('should handle socket cleanup for all players in the room', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const handleLeavingSocketsSpy = jest.spyOn(socketManagerService, 'handleLeavingSockets');
        socketManagerService.getPlayerSocket.returns(socket);

        gateway.lastStanding(mockRoom);

        mockRoom.players.forEach((player) => {
            expect(handleLeavingSocketsSpy).toHaveBeenCalledWith(mockRoom.room.roomCode, player.playerInfo.userName);
        });
    });*/

    it('should stop timers and unsubscribe from timer subscriptions', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));
        mockRoom.game.timer.timerSubscription = { unsubscribe: stub() } as unknown as Subscription;

        const stopTimerSpy = jest.spyOn(gameTimeService, 'stopTimer');

        gateway.endGame(mockRoom, MOCK_GAME_END_NOTHING_OUTPUT);

        expect(stopTimerSpy).toHaveBeenCalledWith(mockRoom.game.timer);
        expect(mockRoom.game.timer.timerSubscription.unsubscribe.called).toBeTruthy();
        if (mockRoom.game.fight) {
            expect(mockRoom.game.fight.timer.timerSubscription.unsubscribe).toHaveBeenCalled();
        }
    });

    it('should emit EndGame event with end result, unsubscribe timers, and send public journals', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));
        mockRoom.game.timer.timerSubscription = { unsubscribe: jest.fn() } as unknown as Subscription;

        mockRoom.game.fight = {
            timer: { timerSubscription: { unsubscribe: jest.fn() } },
        };

        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendPublicJournal');

        gateway.endGame(mockRoom, MOCK_GAME_END_NOTHING_OUTPUT);

        expect(server.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.EndGame, MOCK_GAME_END_NOTHING_OUTPUT)).toBeTruthy();

        expect(mockRoom.game.timer.timerSubscription.unsubscribe).toHaveBeenCalled();
        expect(mockRoom.game.fight?.timer.timerSubscription.unsubscribe).toHaveBeenCalled();

        expect(sendPublicJournalSpy).toHaveBeenCalledWith(mockRoom, JournalEntry.PlayerWin);
        expect(sendPublicJournalSpy).toHaveBeenCalledWith(mockRoom, JournalEntry.GameEnd);
    });

    it('should start the turn by emitting reachable tiles, starting the timer, and emitting StartTurn event', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));

        const emitReachableTilesSpy = jest.spyOn(gateway, 'emitReachableTiles').mockImplementation();
        const startTimerSpy = jest.spyOn(gameTimeService, 'startTimer');

        gateway.startTurn(mockRoom);

        expect(emitReachableTilesSpy).toHaveBeenCalledWith(mockRoom);

        expect(startTimerSpy).toHaveBeenCalledWith(mockRoom.game.timer, TimerDuration.GameTurn);

        expect(server.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.StartTurn, TimerDuration.GameTurn)).toBeTruthy();
    });

    it("should emit PossibleMovement event with reachable tiles to the current player's socket", () => {
        roomManagerService.getRoom.returns(MOCK_ROOM_GAMES.multiplePlayers);
        movementService.getReachableTiles.returns(MOCK_MOVEMENT.reachableTiles);
        socketManagerService.getPlayerSocket.returns(socket);
        roomManagerService.getCurrentRoomPlayer.returns(MOCK_ROOM_GAMES.multiplePlayers.players[0]);

        gateway.emitReachableTiles(MOCK_ROOM_GAMES.multiplePlayers);
        expect(socket.emit.calledWith(GameEvents.PossibleMovement, MOCK_MOVEMENT.reachableTiles)).toBeTruthy();
    });

    it('should emit RemainingTime and handle turn change or turn continuation when counter reaches 0', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const time = 5;
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));
        mockRoom.room.roomCode = 'testRoomCode';
        mockRoom.game.timer.counter = 0;
        mockRoom.game.hasPendingAction = false;
        mockRoom.game.isTurnChange = true;

        jest.useFakeTimers();
        const startTurnSpy = jest.spyOn(gateway, 'startTurn');
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');

        gateway.remainingTime(mockRoom, time);

        expect(server.to.calledWith('testRoomCode')).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.RemainingTime, time)).toBeTruthy();

        jest.runAllTimers();

        expect(startTurnSpy).toHaveBeenCalledWith(mockRoom);
        expect(changeTurnSpy).not.toHaveBeenCalled();

        jest.useRealTimers();
    });

    it('should emit RemainingTime and call changeTurn when counter reaches 0 and isTurnChange is false', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const time = 5;
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));
        mockRoom.room.roomCode = 'testRoomCode';
        mockRoom.game.timer.counter = 0;
        mockRoom.game.hasPendingAction = false;
        mockRoom.game.isTurnChange = false;

        jest.useFakeTimers();
        const startTurnSpy = jest.spyOn(gateway, 'startTurn');
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');

        gateway.remainingTime(mockRoom, time);

        expect(server.to.calledWith('testRoomCode')).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.RemainingTime, time)).toBeTruthy();

        jest.runAllTimers();

        expect(changeTurnSpy).toHaveBeenCalledWith(mockRoom);
        expect(startTurnSpy).not.toHaveBeenCalled();

        jest.useRealTimers();
    });

    it('should register socket on connection and log initialization', () => {
        const registerSocketSpy = jest.spyOn(socketManagerService, 'registerSocket');

        gateway.handleConnection(socket);

        expect(registerSocketSpy).toHaveBeenCalledWith(socket);
    });

    it('should call handlePlayerAbandonment if room exists, game status is not "Waiting", and playerName is found', () => {
        const mockRoom = MOCK_ROOM_GAME;
        const playerName = mockRoom.players[0].playerInfo.userName;
        roomManagerService.getRoom.returns(mockRoom);
        socketManagerService.getDisconnectedPlayerName.returns(mockRoom.players[0].playerInfo.userName);
        const handlePlayerAbandonmentSpy = jest.spyOn(gateway, 'handlePlayerAbandonment').mockImplementation();

        const unregisterSocketSpy = jest.spyOn(socketManagerService, 'unregisterSocket').mockImplementation();
        socket = { data: mockRoom.room.roomCode } as unknown as SinonStubbedInstance<Socket>;

        gateway.handleDisconnect(socket);

        expect(handlePlayerAbandonmentSpy).toHaveBeenCalledWith(mockRoom, playerName);
        expect(unregisterSocketSpy).toHaveBeenCalledWith(socket);
    });
});
