import { MOCK_ROOM_COMBAT } from '@app/constants/combat.test.constants';
import { MOCK_MOVEMENT, MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import {
    MOCK_GAME_END_OUTPUT,
    MOCK_ROOM,
    MOCK_ROOM_GAME,
    MOCK_ROOM_GAME_PLAYER_ABANDONNED,
    MOCK_ROOM_GAME_W_DOORS
} from '@app/constants/test.constants';
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
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameGateway } from './game.gateway';
import { TURN_CHANGE_DELAY_MS } from './game.gateway.consts';

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
        movementService = createStubInstance<PlayerMovementService>(PlayerMovementService);
        gameTimeService = createStubInstance<GameTimeService>(GameTimeService);
        doorService = createStubInstance<DoorOpeningService>(DoorOpeningService);
        socketManagerService = createStubInstance<SocketManagerService>(SocketManagerService);
        gameTurnService = createStubInstance<GameTurnService>(GameTurnService);
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
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        movementService.processPlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);

        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.called).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerMove, MOCK_MOVEMENT.moveResults.normal)).toBeTruthy();
        expect(gateway.emitReachableTiles).toBeCalled();
    });

    it('should not process player movement if it is not the current player', () => {
        gateway.emitReachableTiles = jest.fn();
        socketManagerService.getSocketPlayerName.returns('Player2');
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME);
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        movementService.processPlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);

        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.calledWith(GameEvents.PlayerMove, MOCK_MOVEMENT.moveResults.normal)).toBeFalsy();
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
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.called).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerSlipped, 'Player1')).toBeTruthy();
    });

    it('should not emit PlayerSlipped event if the player has not tripped', () => {
        gateway.emitReachableTiles = jest.fn();
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME);
        movementService.processPlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.emit.neverCalledWith(GameEvents.PlayerSlipped, 'Player1')).toBeTruthy();
        expect(gateway.emitReachableTiles).toBeCalled();
    });

    it('should process desired Door movement and emit PlayerDoor event', () => {
        gateway.emitReachableTiles = jest.fn();
        gateway.endAction = jest.fn();
        doorService.toggleDoor.returns(TileTerrain.ClosedDoor);
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME_W_DOORS);
        roomManagerService.getCurrentRoomPlayer.returns(MOCK_ROOM_GAME_W_DOORS.players[0]);
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_W_DOORS);
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });
        expect(server.to.called).toBeTruthy();
        expect(gateway.emitReachableTiles).toBeCalled();
        expect(
            server.emit.calledWith(GameEvents.PlayerDoor, { updatedTileTerrain: TileTerrain.ClosedDoor, doorPosition: { x: 0, y: 0 } }),
        ).toBeTruthy();
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
        gameEndService.hasGameEnded.returns(MOCK_GAME_END_OUTPUT);
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

    it('should process endTurn and emit ChangeTurn event', () => {
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME);
        gameEndService.hasGameEnded.returns(MOCK_GAME_END_OUTPUT);
        gameTurnService.isTurnFinished.returns(true);
        gateway.endAction(socket);
        expect(changeTurnSpy).toHaveBeenCalled();
    });

    it('should process player abandonment and emit EndGame event', () => {
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_PLAYER_ABANDONNED);
        socketManagerService.getSocketPlayerName.returns('Player1');
        playerAbandonService.processPlayerAbandonment.returns(true);

        gateway.processPlayerAbandonment(socket);

        expect(server.to.called).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerAbandoned, 'Player1')).toBeTruthy();
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

    it('should process not process Desired Evade if is not the current fighter', () => {
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

    // it('should process EndFight Action and start the next fight turn if the fight is not finished', () => {
    //     const startFightSpy = jest.spyOn(fightManagerService, 'startFight');
    //     socketManagerService.getSocketRoom.returns(MOCK_ROOM_COMBAT);
    //     socketManagerService.getSocketPlayerName.returns('Player1');
    //     fightService.isCurrentFighter.returns(true);
    //     gateway.processEndFightAction(socket);
    //     expect(startFightSpy).toBeCalled();
    // });

    it('should not process  EndFight Action if the room and player do not exist', () => {
        const startFightSpy = jest.spyOn(fightManagerService, 'startFight');
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.processDesiredAttack(socket);
        expect(startFightSpy).not.toBeCalled();
    });

    it("should emit PossibleMovement event with reachable tiles to the current player's socket", () => {
        roomManagerService.getRoom.returns(MOCK_ROOM_GAMES.multiplePlayers);
        movementService.getReachableTiles.returns(MOCK_MOVEMENT.reachableTiles);
        socketManagerService.getPlayerSocket.returns(socket);
        roomManagerService.getCurrentRoomPlayer.returns(MOCK_ROOM_GAMES.multiplePlayers.players[0]);

        gateway.emitReachableTiles(MOCK_ROOM_GAMES.multiplePlayers);
        expect(socket.emit.calledWith(GameEvents.PossibleMovement, MOCK_MOVEMENT.reachableTiles)).toBeTruthy();
    });
});
