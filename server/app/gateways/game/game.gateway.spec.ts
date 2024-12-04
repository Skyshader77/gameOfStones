/* eslint-disable */
import { MOCK_PLAYER_STARTS_TESTS } from '@app/constants/gameplay.test.constants';
import { MOCK_MOVEMENT } from '@app/constants/player.movement.test.constants';
import { MOCK_ROOM, MOCK_ROOM_GAME, MOCK_ROOM_GAME_PLAYER_ABANDONNED, MOCK_ROOM_GAME_W_DOORS, MOCK_TIMER } from '@app/constants/test.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { ErrorMessageService } from '@app/services/error-message/error-message.service';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { FightManagerService } from '@app/services/fight/fight-manager/fight-manager.service';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { ItemManagerService } from '@app/services/item/item-manager/item-manager.service';
import { PlayerAbandonService } from '@app/services/player-abandon/player-abandon.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { TurnInfoService } from '@app/services/turn-info/turn-info.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
import * as tileUtils from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ItemUsedPayload } from '@common/interfaces/item';
import { MovementServiceOutput } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable } from 'rxjs';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { TURN_CHANGE_DELAY_MS } from './game.gateway.constants';
import { RoomGame } from '@app/interfaces/room-game';

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
    let itemManagerService: SinonStubbedInstance<ItemManagerService>;
    let virtualStateService: SinonStubbedInstance<VirtualPlayerStateService>;
    let errorMessageService: SinonStubbedInstance<ErrorMessageService>;
    let playerMovementService: SinonStubbedInstance<PlayerMovementService>;
    let turnInfoService: SinonStubbedInstance<TurnInfoService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let logger: SinonStubbedInstance<Logger>;
    let clock: sinon.SinonFakeTimers;
    const mockItemPayload: ItemUsedPayload = {
        usagePosition: { x: 0, y: 0 },
        type: ItemType.GeodeBomb,
    };

    beforeEach(async () => {
        clock = sinon.useFakeTimers();
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
        itemManagerService = createStubInstance<ItemManagerService>(ItemManagerService);
        virtualStateService = createStubInstance<VirtualPlayerStateService>(VirtualPlayerStateService);
        errorMessageService = createStubInstance<ErrorMessageService>(ErrorMessageService);
        playerMovementService = createStubInstance<PlayerMovementService>(PlayerMovementService);
        turnInfoService = createStubInstance<TurnInfoService>(TurnInfoService);
        server = createStubInstance<Server>(Server);
        server.to.returnsThis();
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
                { provide: PlayerMovementService, useValue: playerMovementService },
                { provide: TurnInfoService, useValue: turnInfoService },
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: TurnInfoService,
                    useValue: {
                        sendTurnInformation: jest.fn(),
                    },
                },
                { provide: PlayerAbandonService, useValue: playerAbandonService },
                { provide: RoomManagerService, useValue: roomManagerService },
                { provide: GameEndService, useValue: gameEndService },
                { provide: FightLogicService, useValue: fightService },
                { provide: MessagingGateway, useValue: gameMessagingGateway },
                { provide: FightManagerService, useValue: fightManagerService },
                { provide: ItemManagerService, useValue: itemManagerService },
                { provide: VirtualPlayerStateService, useValue: virtualStateService },
                { provide: ErrorMessageService, useValue: errorMessageService },
            ],
        }).compile();
        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
    });

    afterEach(() => {
        clock.restore();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should start the game and changeTurn', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        socketManagerService.getSocketInformation.returns({ playerName: 'Player1', room: mockRoom });
        socketManagerService.isSocketCurrentPlayer.returns(true);
        gameStartService.startGame.returns(MOCK_PLAYER_STARTS_TESTS);
        gameTimeService.getInitialTimer.returns(MOCK_TIMER);
        const counterValue = 10;
        const mockSubscription = { subscribe: stub().callsFake((callback) => callback(counterValue)) };
        gameTimeService.getTimerSubject.returns(mockSubscription as unknown as Observable<number>);
        socketManagerService.getPlayerSocket.returns(socket);

        gateway.startGame(socket);
        expect(gameStartService.startGame.calledWith(mockRoom, mockRoom.players[0])).toBeTruthy();
        expect(gameTimeService.getTimerSubject).toBeCalled;
        expect(gameTurnService.remainingTime).toBeCalled;
        expect(gameTurnService.changeTurn).toBeCalled;
    });

    it('should handle errors when starting the game due to socket information retrieval failure', () => {
        const socket = {};

        const errorMessage = new Error('Error retrieving socket information');
        jest.spyOn(socketManagerService, 'getSocketInformation').mockImplementation(() => {
            throw errorMessage;
        });

        const gatewayErrorSpy = jest.spyOn(errorMessageService, 'gatewayError').mockImplementation();

        gateway.startGame(socket as unknown as Socket);

        expect(gatewayErrorSpy).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireStartGame, errorMessage);
    });

    it('should handle errors when processing desired move due to socket information retrieval failure', () => {
        const socket = {};
        const mockDestination: Vec2 = { x: 1, y: 1 };

        const errorMessage = new Error('Error retrieving socket information');
        jest.spyOn(socketManagerService, 'getSocketInformation').mockImplementation(() => {
            throw errorMessage;
        });

        const gatewayErrorSpy = jest.spyOn(errorMessageService, 'gatewayError').mockImplementation();

        gateway.processDesiredMove(socket as unknown as Socket, mockDestination);

        expect(gatewayErrorSpy).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireMove, errorMessage);
    });

    it('should handle errors when processing desired door due to socket information retrieval failure', () => {
        const socket = {};
        const mockDoorPosition: Vec2 = { x: 1, y: 1 };

        const errorMessage = new Error('Error retrieving socket information');
        jest.spyOn(socketManagerService, 'getSocketInformation').mockImplementation(() => {
            throw errorMessage;
        });

        const gatewayErrorSpy = jest.spyOn(errorMessageService, 'gatewayError').mockImplementation();

        gateway.processDesiredDoor(socket as unknown as Socket, mockDoorPosition);

        expect(gatewayErrorSpy).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireToggleDoor, errorMessage);
    });

    it('should handle errors when processing teleport due to socket information retrieval failure', () => {
        const socket = {};
        const mockDestination: Vec2 = { x: 2, y: 2 };

        const errorMessage = new Error('Error retrieving socket information');
        jest.spyOn(socketManagerService, 'getSocketInformation').mockImplementation(() => {
            throw errorMessage;
        });

        const gatewayErrorSpy = jest.spyOn(errorMessageService, 'gatewayError').mockImplementation();

        gateway.processTeleport(socket as unknown as Socket, mockDestination);

        expect(gatewayErrorSpy).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireTeleport, errorMessage);
    });

    it('should handle errors when ending the turn due to socket information retrieval failure', () => {
        const socket = {};

        const errorMessage = new Error('Error retrieving socket information');
        jest.spyOn(socketManagerService, 'getSocketInformation').mockImplementation(() => {
            throw errorMessage;
        });

        const gatewayErrorSpy = jest.spyOn(errorMessageService, 'gatewayError').mockImplementation();

        gateway.endTurn(socket as unknown as Socket);

        expect(gatewayErrorSpy).toHaveBeenCalledWith(Gateway.Game, GameEvents.EndTurn, errorMessage);
    });

    it('should not process player movement if it is not the current player', () => {
        socketManagerService.getSocketInformation.returns({ playerName: 'Player2', room: MOCK_ROOM_GAME });
        socketManagerService.isSocketCurrentPlayer.returns(false);
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM.roomCode);
        movementService.executePlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);

        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.called).toBeFalsy();
    });

    it('should not process player movement if the room and player do not exist', () => {
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.calledWith(GameEvents.PlayerMove, MOCK_MOVEMENT.moveResults.normal)).toBeFalsy();
    });

    it('should not emit PlayerSlipped event if the player has not tripped', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
        movementService.executePlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);
        socketManagerService.getSocketInformation.returns({ playerName: 'Player1', room: mockRoom });
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM_GAME.room.roomCode);
        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.emit.neverCalledWith(GameEvents.PlayerSlipped, 'Player1')).toBeTruthy();
    });

    it('should process desired Door movement and emit PlayerDoor event for opening a door', () => {
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_W_DOORS.players[0]));
        gateway.endAction = jest.fn();

        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendGenericPublicJournal');
        roomManagerService.getCurrentRoomPlayer.returns(mockPlayer);
        socketManagerService.getSocketInformation.returns({ playerName: mockPlayer.playerInfo.userName, room: MOCK_ROOM_GAME_W_DOORS });
        socketManagerService.isSocketCurrentPlayer.returns(true);
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM_GAME_W_DOORS.room.roomCode);

        doorService.toggleDoor.returns(TileTerrain.OpenDoor);
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });
        expect(sendPublicJournalSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_W_DOORS, JournalEntry.DoorOpen);
    });

    it('should process desired Door movement and emit PlayerDoor event for closing a door', () => {
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_W_DOORS.players[0]));
        gateway.endAction = jest.fn();
        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendGenericPublicJournal');

        roomManagerService.getCurrentRoomPlayer.returns(mockPlayer);
        socketManagerService.getSocketInformation.returns({ playerName: mockPlayer.playerInfo.userName, room: MOCK_ROOM_GAME_W_DOORS });
        socketManagerService.isSocketCurrentPlayer.returns(true);
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM_GAME_W_DOORS.room.roomCode);

        doorService.toggleDoor.returns(TileTerrain.ClosedDoor);
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });

        expect(sendPublicJournalSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_W_DOORS, JournalEntry.DoorClose);
    });

    it('should not process door action if room or playerName is missing', () => {
        const emitSpy = jest.spyOn(server, 'to');
        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendGenericPublicJournal');
        const getReachableTilesSpy = jest.spyOn(movementService, 'getReachableTiles');

        socketManagerService.getSocketInformation.returns({ playerName: 'Player1', room: undefined });
        gateway.processDesiredDoor(socket, { x: 1, y: 1 });

        expect(emitSpy).not.toHaveBeenCalled();
        expect(sendPublicJournalSpy).not.toHaveBeenCalled();
        expect(getReachableTilesSpy).not.toHaveBeenCalled();

        socketManagerService.getSocketInformation.returns({ playerName: undefined, room: MOCK_ROOM_GAME });

        gateway.processDesiredDoor(socket, { x: 1, y: 1 });

        expect(emitSpy).not.toHaveBeenCalled();
        expect(sendPublicJournalSpy).not.toHaveBeenCalled();
        expect(getReachableTilesSpy).not.toHaveBeenCalled();
    });

    it('should not process desired Door movement if it is not the current player', () => {
        doorService.toggleDoor.returns(TileTerrain.ClosedDoor);
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME_W_DOORS);
        socketManagerService.getSocketInformation.returns({ playerName: 'Player2', room: MOCK_ROOM_GAME_W_DOORS });
        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendGenericPublicJournal');
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });
        expect(sendPublicJournalSpy).not.toHaveBeenCalled();
    });

    it('should not process desired Door movement if the room and player do not exist', () => {
        doorService.toggleDoor.returns(TileTerrain.ClosedDoor);
        socketManagerService.getSocketInformation.returns({ playerName: 'Player5', room: MOCK_ROOM_GAME_W_DOORS });
        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendGenericPublicJournal');
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });
        expect(sendPublicJournalSpy).not.toHaveBeenCalled();
    });

    it('should process endTurn and emit ChangeTurn event', () => {
        const changeTurnSpy = jest.spyOn(gameTurnService, 'changeTurn').mockImplementation();
        socketManagerService.getSocketInformation.returns({ playerName: 'Player1', room: MOCK_ROOM_GAME });
        socketManagerService.isSocketCurrentPlayer.returns(true);
        jest.spyOn<any, string>(gameTurnService, 'nextTurn').mockReturnValue('Player2');
        // gameEndService.hasGameEnded.returns(MOCK_GAME_END_NOTHING_OUTPUT);
        gateway.endTurn(socket);
        clock.tick(TURN_CHANGE_DELAY_MS);
        expect(changeTurnSpy).toHaveBeenCalled();
    });

    it('should not process endTurn if it is not the current player', () => {
        const changeTurnSpy = jest.spyOn(gameTurnService, 'changeTurn').mockImplementation();
        socketManagerService.getSocketPlayerName.returns('Player2');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_GAME);
        socketManagerService.getSocketInformation.returns({ playerName: 'Player2', room: MOCK_ROOM_GAME });
        gateway.endTurn(socket);
        clock.tick(TURN_CHANGE_DELAY_MS);
        expect(changeTurnSpy).not.toHaveBeenCalled();
    });

    it('should not process player movement if the room and player do not exist', () => {
        const changeTurnSpy = jest.spyOn(gameTurnService, 'changeTurn').mockImplementation();
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.endTurn(socket);
        clock.tick(TURN_CHANGE_DELAY_MS);
        expect(changeTurnSpy).not.toHaveBeenCalled();
        clock.restore();
    });

    it('should not process endAction if it is not the current player', () => {
        socketManagerService.getSocketInformation.returns({ playerName: 'Player2', room: MOCK_ROOM_GAME });
        const changeTurnSpy = jest.spyOn(gameTurnService, 'changeTurn').mockImplementation();
        gateway.endAction(socket);
        expect(changeTurnSpy).not.toHaveBeenCalled();
    });

    it('should not process player movement if the room and player do not exist', () => {
        socketManagerService.getSocketPlayerName.returns('Player5');
        const changeTurnSpy = jest.spyOn(gameTurnService, 'changeTurn').mockImplementation();
        gateway.endAction(socket);
        expect(changeTurnSpy).not.toHaveBeenCalled();
    });

    it('should process endAction and emit an error if handleEndAction throws an exception', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.status = GameStatus.Fight;
        mockRoom.game.currentPlayer = 'Player1';
        socketManagerService.getSocketInformation.returns({ playerName: 'Player1', room: mockRoom });
        const handleEndActionSpy = jest.spyOn(gameTurnService, 'handleEndAction').mockImplementation();

        gateway.endAction(socket);

        expect(handleEndActionSpy).toHaveBeenCalledWith(mockRoom);
    });

    it('should process endAction', () => {
        socketManagerService.getSocketInformation.returns({ playerName: 'Player1', room: MOCK_ROOM_GAME });
        const handleEndActionSpy = jest.spyOn(gameTurnService, 'handleEndAction').mockImplementation();
        gateway.endAction(socket);
        expect(handleEndActionSpy).toHaveBeenCalled();
    });

    it('should handle player abandonment and handle fighter abandonment if player is in fight', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME.players[0]));
        const playerName = 'Player1';
        roomManagerService.getPlayerInRoom.returns(mockPlayer);
        playerAbandonService.processPlayerAbandonment.returns(true);
        fightManagerService.isInFight.returns(true);

        const processFighterAbandonmentSpy = jest.spyOn(fightManagerService, 'processFighterAbandonment');

        gateway.handlePlayerAbandonment(mockRoom, playerName);

        expect(processFighterAbandonmentSpy).toHaveBeenCalledWith(mockRoom, playerName);
    });

    it('should process player abandonment and call handlePlayerAbandonment if the room and player exist', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME.players[0]));
        const playerName = 'Player1';
        socketManagerService.getSocketInformation.returns({ playerName, room: mockRoom });
        roomManagerService.getPlayerInRoom.returns(mockPlayer);
        playerAbandonService.processPlayerAbandonment.returns(true);
        fightManagerService.isInFight.returns(true);

        const handlePlayerAbandonmentSpy = jest.spyOn(gateway as any, 'handlePlayerAbandonment');

        gateway.processPlayerAbandonment(socket);

        expect(handlePlayerAbandonmentSpy).toHaveBeenCalledWith(mockRoom, playerName);
    });

    it('should handle player abandonment and emit an error if an exception is thrown', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const playerName = 'Player1';

        socketManagerService.getSocketInformation.returns({ playerName, room: mockRoom });
        const handlePlayerAbandonmentSpy = jest.spyOn(gateway, 'handlePlayerAbandonment').mockImplementation();

        gateway.processPlayerAbandonment(socket);

        expect(handlePlayerAbandonmentSpy).toHaveBeenCalledWith(mockRoom, playerName);
    });

    it('should emit PlayerAbandoned event and call gameCleanup when all but one player has abandoned', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const playerName = 'Player1';

        const sendAbandonJournalSpy = jest.spyOn(gameMessagingGateway, 'sendAbandonJournal');
        const processPlayerAbandonmentSpy = jest.spyOn(playerAbandonService, 'processPlayerAbandonment').mockReturnValue(true);
        const isInFightSpy = jest.spyOn(fightManagerService, 'isInFight').mockReturnValue(false);
        const abandonCountSpy = jest.spyOn(playerAbandonService, 'getRemainingPlayerCount').mockReturnValue(1);
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME.players[0]));
        roomManagerService.getPlayerInRoom.returns(mockPlayer);
        gateway.handlePlayerAbandonment(mockRoom, playerName);

        expect(sendAbandonJournalSpy).toHaveBeenCalledWith(mockRoom, playerName);
        expect(processPlayerAbandonmentSpy).toHaveBeenCalled();
        expect(isInFightSpy).toHaveBeenCalledWith(mockRoom, playerName);
        expect(abandonCountSpy).toHaveBeenCalledWith(mockRoom.players);
        expect(server.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerAbandoned, playerName)).toBeTruthy();
    });

    it('should not do abandon a player if there is no room or player name', () => {
        socketManagerService.getSocketInformation.returns({ playerName: undefined, room: undefined });
        gateway.processPlayerAbandonment(socket);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.called).toBeFalsy();
    });

    it('should not do abandon a player if playerAbandonment returns false', () => {
        socketManagerService.getSocketInformation.returns({ playerName: 'Player1', room: MOCK_ROOM_GAME_PLAYER_ABANDONNED });
        playerAbandonService.processPlayerAbandonment.returns(false);

        gateway.processPlayerAbandonment(socket);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.called).toBeFalsy();
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

    it('should handle item drop when player is current player', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        socketManagerService.getSocketInformation.returns({
            playerName: 'Player1',
            room: mockRoom,
        });
        socketManagerService.isSocketCurrentPlayer.returns(true);

        gateway.processDesireItemDrop(socket, ItemType.GeodeBomb);

        sinon.assert.calledOnce(itemManagerService.handleItemDrop);
        sinon.assert.calledWith(itemManagerService.handleItemDrop, mockRoom, 'Player1', ItemType.GeodeBomb);
    });

    it('should not handle item drop when player is not current player', () => {
        socketManagerService.getSocketInformation.returns({
            playerName: 'Player2',
            room: MOCK_ROOM_GAME,
        });
        socketManagerService.isSocketCurrentPlayer.returns(false);

        gateway.processDesireItemDrop(socket, ItemType.GeodeBomb);

        sinon.assert.notCalled(itemManagerService.handleItemDrop);
    });

    it('should handle error when socket information is invalid', () => {
        socketManagerService.getSocketInformation.throws(new Error('Invalid socket'));

        gateway.processDesireItemDrop(socket, ItemType.GeodeBomb);

        sinon.assert.calledOnce(errorMessageService.gatewayError);
    });

    it('should handle item use successfully', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        socketManagerService.getSocketInformation.returns({
            playerName: 'Player1',
            room: mockRoom,
        });
        const useSpecialItemStub = sinon.stub(gateway as any, 'useSpecialItem');

        gateway.processDesireUseItem(socket, mockItemPayload);

        expect(useSpecialItemStub.calledOnce).toBeTruthy();
        expect(useSpecialItemStub.calledWith(mockRoom, 'Player1', mockItemPayload)).toBeTruthy();

        useSpecialItemStub.restore();
    });

    it('should handle error when using item', () => {
        socketManagerService.getSocketInformation.returns({
            playerName: 'Player1',
            room: MOCK_ROOM_GAME,
        });
        gateway.useSpecialItem = sinon.stub().throws(new Error('Item use error'));

        gateway.processDesireUseItem(socket, mockItemPayload);

        sinon.assert.calledOnce(errorMessageService.gatewayError);
    });

    it('should handle teleport in debug mode', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.isDebugMode = true;
        mockRoom.game.hasPendingAction = false;
        mockRoom.game.currentPlayer = 'Player1';
        const mockDestination = { x: 2, y: 2 };
        const mockPlayer = {
            playerInfo: { userName: 'Player1' },
            playerInGame: { currentPosition: { x: 0, y: 0 } },
        };
        mockRoom.players = [mockPlayer];

        socketManagerService.getSocketInformation.returns({
            playerName: 'Player1',
            room: mockRoom,
        });

        const isTileUnavailableMock = jest.spyOn(tileUtils, 'isTileUnavailable').mockReturnValue(false);
        const isItemOnTileMock = jest.spyOn(tileUtils, 'isItemOnTile').mockReturnValue(false);

        gateway.processTeleport(socket, mockDestination);

        expect(server.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        expect(
            server.emit.calledWith(GameEvents.Teleport, {
                playerName: 'Player1',
                destination: mockDestination,
            }),
        ).toBeTruthy();

        expect(isTileUnavailableMock).toHaveBeenCalledWith(mockDestination, mockRoom.game.map.mapArray, mockRoom.players);
        expect(isItemOnTileMock).toHaveBeenCalledWith(mockDestination, mockRoom.game.map);
    });

    it('should not teleport when not in debug mode', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.isDebugMode = false;
        mockRoom.game.currentPlayer = 'Player1';
        const mockDestination = { x: 2, y: 2 };
        const mockPlayer = {
            playerInfo: { userName: 'Player1' },
            playerInGame: { currentPosition: { x: 0, y: 0 } },
        };
        mockRoom.players = [mockPlayer];

        socketManagerService.getSocketInformation.returns({
            playerName: 'Player1',
            room: mockRoom,
        });

        gateway.processTeleport(socket, mockDestination);

        expect(server.emit.called).toBeFalsy();
    });

    it('should not teleport when not current player', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.isDebugMode = true;
        mockRoom.game.currentPlayer = 'Player2';
        const mockDestination = { x: 2, y: 2 };
        const mockPlayer = {
            playerInfo: { userName: 'Player1' },
            playerInGame: { currentPosition: { x: 0, y: 0 } },
        };
        mockRoom.players = [mockPlayer];

        socketManagerService.getSocketInformation.returns({
            playerName: 'Player1',
            room: mockRoom,
        });

        gateway.processTeleport(socket, mockDestination);

        expect(server.emit.called).toBeFalsy();
    });

    it('should toggle debug mode', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.isDebugMode = false;

        socketManagerService.getSocketInformation.returns({
            playerName: 'Player1',
            room: mockRoom,
        });

        gateway.desireDebugMode(socket);

        expect(mockRoom.game.isDebugMode).toBeTruthy();
        sinon.assert.calledWith(server.to, mockRoom.room.roomCode);
        sinon.assert.calledWith(server.emit, GameEvents.DebugMode, true);
        sinon.assert.calledOnce(gameMessagingGateway.sendGenericPublicJournal);
    });

    it('should handle error when toggling debug mode', () => {
        socketManagerService.getSocketInformation.throws(new Error('Toggle error'));

        gateway.desireDebugMode(socket);

        sinon.assert.calledOnce(errorMessageService.gatewayError);
    });

    describe('afterInit', () => {
        it('should set gateway server for socket manager', () => {
            const setGatewayServerSpy = jest.spyOn(socketManagerService, 'setGatewayServer');

            gateway.afterInit();

            expect(setGatewayServerSpy).toHaveBeenCalledWith(Gateway.Game, gateway['server']);
        });
    });

    describe('gameCleanup', () => {
        it('should stop timers, unsubscribe, remove sockets, and delete room', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.game.timer = {
                timerSubscription: {
                    unsubscribe: jest.fn(),
                },
            };
            mockRoom.game.virtualState = {
                aiTurnSubscription: {
                    unsubscribe: jest.fn(),
                },
            };
            mockRoom.game.fight = {
                timer: {
                    timerSubscription: {
                        unsubscribe: jest.fn(),
                    },
                },
            };

            const stopTimerSpy = jest.spyOn(gameTimeService, 'stopTimer');
            const deleteRoomSpy = jest.spyOn(roomManagerService, 'deleteRoom');
            const handleLeavingSocketsSpy = jest.spyOn(socketManagerService, 'handleLeavingSockets');

            gateway['gameCleanup'](mockRoom);

            expect(stopTimerSpy).toHaveBeenCalledTimes(2);
            expect(mockRoom.game.timer.timerSubscription.unsubscribe).toHaveBeenCalled();
            expect(mockRoom.game.virtualState.aiTurnSubscription.unsubscribe).toHaveBeenCalled();
            expect(mockRoom.game.fight.timer.timerSubscription.unsubscribe).toHaveBeenCalled();

            mockRoom.players.forEach((player) => {
                expect(handleLeavingSocketsSpy).toHaveBeenCalledWith(mockRoom.room.roomCode, player.playerInfo.userName);
            });

            expect(deleteRoomSpy).toHaveBeenCalledWith(mockRoom.room.roomCode);
        });

        it('should handle room cleanup when no fight or AI turn exists', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.game.timer = {
                timerSubscription: {
                    unsubscribe: jest.fn(),
                },
            };
            mockRoom.game.virtualState = {};
            mockRoom.game.fight = undefined;

            const stopTimerSpy = jest.spyOn(gameTimeService, 'stopTimer');
            const deleteRoomSpy = jest.spyOn(roomManagerService, 'deleteRoom');
            const handleLeavingSocketsSpy = jest.spyOn(socketManagerService, 'handleLeavingSockets');

            gateway['gameCleanup'](mockRoom);

            expect(stopTimerSpy).toHaveBeenCalledTimes(1);
            expect(mockRoom.game.timer.timerSubscription.unsubscribe).toHaveBeenCalled();

            mockRoom.players.forEach((player) => {
                expect(handleLeavingSocketsSpy).toHaveBeenCalledWith(mockRoom.room.roomCode, player.playerInfo.userName);
            });

            expect(deleteRoomSpy).toHaveBeenCalledWith(mockRoom.room.roomCode);
        });
    });

    describe('sendMove', () => {
        it('should execute player movement and emit PlayerMove event', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            const mockDestination: Vec2 = { x: 1, y: 1 };
            const mockMovementResult: MovementServiceOutput = {
                isOnItem: false,
                hasTripped: false,
                optimalPath: {
                    remainingMovement: 2,
                    position: undefined,
                    path: [],
                    cost: 0,
                },
                interactiveObject: undefined,
            };

            roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
            playerMovementService.executePlayerMovement.returns(mockMovementResult);

            gateway['sendMove'](mockRoom, mockDestination);

            expect(server.to.called).toBeTruthy();
            expect(mockRoom.game.hasPendingAction).toBeTruthy();
        });

        it('should handle virtual player movement', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.players[0].playerInfo.role = PlayerRole.AggressiveAI;
            const mockPlayer = mockRoom.players[0];
            const mockDestination: Vec2 = { x: 1, y: 1 };
            const mockMovementResult: MovementServiceOutput = {
                isOnItem: false,
                hasTripped: false,
                optimalPath: {
                    remainingMovement: 2,
                    position: undefined,
                    path: [],
                    cost: 0,
                },
                interactiveObject: undefined,
            };

            roomManagerService.getCurrentRoomPlayer.returns(mockPlayer);
            playerMovementService.executePlayerMovement.returns(mockMovementResult);

            const handleMovementSpy = jest.spyOn(virtualStateService, 'handleMovement');

            gateway['sendMove'](mockRoom, mockDestination);

            expect(handleMovementSpy).toHaveBeenCalled();
        });

        it('should pick up item when player moves on an item', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            const mockDestination: Vec2 = { x: 1, y: 1 };
            const mockMovementResult: MovementServiceOutput = {
                isOnItem: true,
                hasTripped: false,
                optimalPath: {
                    remainingMovement: 2,
                    position: undefined,
                    path: [],
                    cost: 0,
                },
                interactiveObject: undefined,
            };
            roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
            playerMovementService.executePlayerMovement.returns(mockMovementResult);
            const pickUpItemSpy = jest.spyOn(gateway as any, 'pickUpItem');

            gateway['sendMove'](mockRoom, mockDestination);
            expect(pickUpItemSpy).toHaveBeenCalled();
        });

        it('should emit PlayerSlipped event when player trips', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            const mockDestination: Vec2 = { x: 1, y: 1 };
            const mockMovementResult: MovementServiceOutput = {
                isOnItem: true,
                hasTripped: true,
                optimalPath: {
                    remainingMovement: 2,
                    position: undefined,
                    path: [],
                    cost: 0,
                },
                interactiveObject: undefined,
            };

            roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
            playerMovementService.executePlayerMovement.returns(mockMovementResult);

            gateway['sendMove'](mockRoom, mockDestination);

            expect(mockRoom.game.hasSlipped).toBeTruthy();
            expect(server.to.called).toBeTruthy();
        });
    });

    describe('handleRemainingPlayers', () => {
        beforeEach(() => {
            // Reset stubs before each test
            turnInfoService.sendTurnInformation.reset();
            gameTurnService.changeTurn.reset();
        });

        it('should call gameCleanup when no players remain', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.game.timer = {
                timerSubscription: {
                    unsubscribe: sinon.stub(),
                },
            };
            mockRoom.game.virtualState = {
                aiTurnSubscription: {
                    unsubscribe: sinon.stub(),
                },
            };

            playerAbandonService.getRemainingPlayerCount.returns(0);

            gateway['handleRemainingPlayers'](mockRoom);

            expect(gameTimeService.stopTimer.calledWith(mockRoom.game.timer)).toBeTruthy();
            expect(mockRoom.game.timer.timerSubscription.unsubscribe.called).toBeTruthy();
            expect(mockRoom.game.virtualState.aiTurnSubscription.unsubscribe.called).toBeTruthy();
            expect(roomManagerService.deleteRoom.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        });

        it('should change turn when current player has abandoned', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.game.status = GameStatus.OverWorld;

            playerAbandonService.getRemainingPlayerCount.returns(2);
            playerAbandonService.hasCurrentPlayerAbandoned.returns(true);
            playerAbandonService.isPlayerAloneWithBots.returns(false);

            gateway['handleRemainingPlayers'](mockRoom);

            expect(gameTurnService.changeTurn.calledWith(mockRoom)).toBeTruthy();
        });

        it('should not change turn when current player has not abandoned', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.game.status = GameStatus.OverWorld;

            playerAbandonService.getRemainingPlayerCount.returns(2);
            playerAbandonService.hasCurrentPlayerAbandoned.returns(false);
            playerAbandonService.isPlayerAloneWithBots.returns(false);

            // Create a new stub instance for turnInfoService
            const turnInfoStub = createStubInstance(TurnInfoService);
            gateway['turnInfoService'] = turnInfoStub;

            gateway['handleRemainingPlayers'](mockRoom);

            expect(gameTurnService.changeTurn.called).toBeFalsy();
            expect(turnInfoStub.sendTurnInformation.calledOnceWith(mockRoom)).toBeTruthy();
        });
    });

    describe('processDesiredMove', () => {
        it('should call sendMove when socket is current player', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            const destination: Vec2 = { x: 1, y: 1 };

            socketManagerService.getSocketInformation.returns({
                playerName: 'Player1',
                room: mockRoom,
            });
            socketManagerService.isSocketCurrentPlayer.returns(true);

            const sendMoveSpy = sinon.spy(gateway as any, 'sendMove');

            gateway.processDesiredMove(socket, destination);

            expect(sendMoveSpy.calledWith(mockRoom, destination)).toBeTruthy();
            sendMoveSpy.restore();
        });

        it('should not call sendMove when socket is not current player', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            const destination: Vec2 = { x: 1, y: 1 };

            socketManagerService.getSocketInformation.returns({
                playerName: 'Player2',
                room: mockRoom,
            });
            socketManagerService.isSocketCurrentPlayer.returns(false);

            const sendMoveSpy = sinon.spy(gateway as any, 'sendMove');

            gateway.processDesiredMove(socket, destination);

            expect(sendMoveSpy.called).toBeFalsy();
            sendMoveSpy.restore();
        });
    });

    describe('useSpecialItem', () => {
        it('should call itemManagerService.handleItemUsed with correct parameters', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            const playerName = 'Player1';
            const itemPayload: ItemUsedPayload = {
                usagePosition: { x: 1, y: 1 },
                type: ItemType.GeodeBomb,
            };

            // Reset the stub before test
            itemManagerService.handleItemUsed.reset();

            gateway.useSpecialItem(mockRoom, playerName, itemPayload);

            expect(itemManagerService.handleItemUsed.calledOnce).toBeTruthy();
            expect(itemManagerService.handleItemUsed.calledWith(mockRoom, playerName, itemPayload)).toBeTruthy();
        });
    });

    describe('gameCleanup', () => {
        beforeEach(() => {
            gameTimeService.stopTimer.reset();
        });
    
        it('should unsubscribe from aiTurnSubscription when it exists', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.game.timer = {
                timerSubscription: { unsubscribe: sinon.stub() }
            };
            mockRoom.game.virtualState = {
                aiTurnSubscription: { unsubscribe: sinon.stub() }
            };
            mockRoom.game.fight = undefined;
    
            gateway['gameCleanup'](mockRoom);
    
            expect(mockRoom.game.virtualState.aiTurnSubscription.unsubscribe.called).toBeTruthy();
        });
    
        it('should not attempt to unsubscribe when aiTurnSubscription is null', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.game.timer = {
                timerSubscription: { unsubscribe: sinon.stub() }
            };
            mockRoom.game.virtualState = {
                aiTurnSubscription: null
            };
            mockRoom.game.fight = undefined;
    
            gateway['gameCleanup'](mockRoom);
    
            expect(mockRoom.game.timer.timerSubscription.unsubscribe.called).toBeTruthy();
        });
    
        it('should handle fight cleanup and unsubscribe when timerSubscription exists', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            const unsubscribeSpy = sinon.stub();
            mockRoom.game.timer = {
                timerSubscription: { unsubscribe: sinon.stub() }
            };
            mockRoom.game.virtualState = {};
            mockRoom.game.fight = {
                timer: {
                    timerSubscription: { unsubscribe: unsubscribeSpy }
                }
            };
    
            gateway['gameCleanup'](mockRoom);
    
            expect(gameTimeService.stopTimer.calledWith(mockRoom.game.fight.timer)).toBeTruthy();
            expect(unsubscribeSpy.called).toBeTruthy();
        });
    
        it('should handle fight cleanup without error when timerSubscription is undefined', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.game.timer = {
                timerSubscription: { unsubscribe: sinon.stub() }
            };
            mockRoom.game.virtualState = {};
            mockRoom.game.fight = {
                timer: {
                    something: 'else' // timer exists but no timerSubscription
                }
            };
    
            gateway['gameCleanup'](mockRoom);
    
            expect(gameTimeService.stopTimer.calledWith(mockRoom.game.fight.timer)).toBeTruthy();
        });
    
        it('should handle non-existent fight', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.game.timer = {
                timerSubscription: { unsubscribe: sinon.stub() }
            };
            mockRoom.game.virtualState = {};
            mockRoom.game.fight = undefined;
    
            gateway['gameCleanup'](mockRoom);
    
            expect(gameTimeService.stopTimer.calledOnce).toBeTruthy();
            expect(mockRoom.game.timer.timerSubscription.unsubscribe.called).toBeTruthy();
        });
    });  
});
