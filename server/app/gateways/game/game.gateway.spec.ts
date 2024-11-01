import { MOCK_MOVEMENT } from '@app/constants/player.movement.test.constants';
import { MOCK_ROOM, MOCK_ROOM_GAME, MOCK_ROOM_GAME_PLAYER_ABANDONNED } from '@app/constants/test.constants';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { PlayerAbandonService } from '@app/services/player-abandon/player-abandon.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { GameEvents } from '@common/interfaces/sockets.events/game.events';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameGateway } from './game.gateway';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let movementService: SinonStubbedInstance<PlayerMovementService>;
    let gameTimeService: SinonStubbedInstance<GameTimeService>;
    let doorService: SinonStubbedInstance<DoorOpeningService>;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    let gameTurnService: SinonStubbedInstance<GameTurnService>;
    let gameStartService: SinonStubbedInstance<GameStartService>;
    let playerAbandonService: SinonStubbedInstance<PlayerAbandonService>;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
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

    // TODO the constants are not well made
    // it('should process desired Door movement and emit PlayerDoor event', () => {
    //     doorService.toggleDoor.returns(TileTerrain.CLOSEDDOOR);
    //     roomManagerService.getRoom.returns(MOCK_ROOM_GAME);
    //     socketManagerService.getSocketPlayerName.returns('Player1');
    //     socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME);
    //     gateway.processDesiredDoor(socket, { x: 0, y: 0 });
    //     expect(server.to.called).toBeTruthy();
    //     expect(
    //         server.emit.calledWith(GameEvents.PlayerDoor, { updatedTileTerrain: TileTerrain.CLOSEDDOOR, doorPosition: { x: 0, y: 0 } }),
    //     ).toBeTruthy();
    // });
    // it('should process endTurn action and emit ChangeTurn event', () => {
    //     gateway.emitPossibleMovements = jest.fn();
    //     const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
    //     const clock = sinon.useFakeTimers();
    //     socketManagerService.getSocketPlayerName.returns('Player1');
    //     socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_PLAYER_ABANDONNED);
    //     gameTurnService.nextTurn.returns('Player1');
    //     gateway.endTurn(socket);
    //     clock.tick(TURN_CHANGE_DELAY_MS);
    //     expect(changeTurnSpy).toHaveBeenCalled();
    //     clock.restore();
    // });

    it('should process player abandonment and emit EndGame event', () => {
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_PLAYER_ABANDONNED);
        socketManagerService.getSocketPlayerName.returns('Player1');
        playerAbandonService.processPlayerAbandonment.returns(true);

        gateway.processPlayerAbandonning(socket);

        expect(server.to.called).toBeTruthy();
        expect(
            server.emit.calledWith(GameEvents.PlayerAbandoned, {
                hasAbandonned: true,
                playerName: 'Player1',
            }),
        ).toBeTruthy();
    });

    it('should not do abandon a player if there is no room or player name', () => {
        socketManagerService.getSocketRoom.returns(undefined);
        socketManagerService.getSocketPlayerName.returns(undefined);
        gateway.processPlayerAbandonning(socket);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.called).toBeFalsy();
    });

    it('should not do abandon a player if playerAbandonment returns false', () => {
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_PLAYER_ABANDONNED);
        socketManagerService.getSocketPlayerName.returns('Player1');
        playerAbandonService.processPlayerAbandonment.returns(false);

        gateway.processPlayerAbandonning(socket);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.called).toBeFalsy();
    });

    it("should emit PossibleMovement event with reachable tiles to the current player's socket", () => {
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME);
        movementService.getReachableTiles.returns(MOCK_MOVEMENT.reachableTiles);
        gateway.emitReachableTiles(socket, MOCK_ROOM_GAME);
        expect(socket.emit.calledWith(GameEvents.PossibleMovement, MOCK_MOVEMENT.reachableTiles)).toBeTruthy();
    });
});
