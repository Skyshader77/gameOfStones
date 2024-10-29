import { MOCK_MOVE_DATA, MOCK_MOVE_RESULT, MOCK_MOVE_RESULT_TRIPPED } from '@app/constants/player.movement.test.constants';
import { MOCK_ROOM, MOCK_ROOM_GAME_PLAYER_ABANDONNED } from '@app/constants/test.constants';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { GameEvents } from '@common/interfaces/sockets.events/game.events';
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
            ],
        }).compile();
        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should process player movement and emit PlayerMove event', () => {
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        movementService.processPlayerMovement.returns(MOCK_MOVE_RESULT);

        gateway.processDesiredMove(socket, MOCK_MOVE_DATA);
        expect(server.to.called).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerMove, MOCK_MOVE_RESULT)).toBeTruthy();
    });

    it('should emit PlayerSlipped event if the player has tripped', () => {
        movementService.processPlayerMovement.returns(MOCK_MOVE_RESULT_TRIPPED);
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        gateway.processDesiredMove(socket, MOCK_MOVE_DATA);
        expect(server.to.called).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerSlipped, 'Player1')).toBeTruthy();
    });

    it('should not emit PlayerSlipped event if the player has not tripped', () => {
        movementService.processPlayerMovement.returns(MOCK_MOVE_RESULT);
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        gateway.processDesiredMove(socket, MOCK_MOVE_DATA);
        expect(server.emit.neverCalledWith(GameEvents.PlayerSlipped, 'Player1')).toBeTruthy();
    });

    it('should process desired Door movement and emit PlayerDoor event', () => {
        doorService.toggleDoor.returns(TileTerrain.CLOSEDDOOR);
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });
        expect(server.to.called).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerDoor, TileTerrain.CLOSEDDOOR)).toBeTruthy();
    });

    it('should process endTurn action and emit ChangeTurn event', () => {
        const changeTurnSpy = jest.spyOn(gateway, 'changeTurn');
        const clock = sinon.useFakeTimers();
        socketManagerService.getSocketPlayerName.returns('Player1');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME_PLAYER_ABANDONNED);
        gameTurnService.nextTurn.returns('Player1');
        gateway.endTurn(socket);
        clock.tick(TURN_CHANGE_DELAY_MS);
        expect(changeTurnSpy).toHaveBeenCalled();
        clock.restore();
    });
});
