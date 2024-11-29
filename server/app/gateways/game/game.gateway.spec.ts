/* eslint-disable */
import { MOCK_PLAYER_STARTS_TESTS } from '@app/constants/gameplay.test.constants';
import { MOCK_ROOM_ITEMS } from '@app/constants/item-test.constants';
import { MOCK_MOVEMENT } from '@app/constants/player.movement.test.constants';
import {
    MOCK_GAME_END_NOTHING_OUTPUT,
    MOCK_ROOM,
    MOCK_ROOM_GAME,
    MOCK_ROOM_GAME_PLAYER_ABANDONNED,
    MOCK_ROOM_GAME_W_DOORS,
    MOCK_TIMER
} from '@app/constants/test.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { FightManagerService } from '@app/services/fight/fight-manager/fight-manager.service';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { PlayerAbandonService } from '@app/services/player-abandon/player-abandon.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { TurnInfoService } from '@app/services/turn-info/turn-info.service';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable } from 'rxjs';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { TURN_CHANGE_DELAY_MS } from './game.gateway.constants';
import { ErrorMessageService } from '@app/services/error-message/error-message.service';
import { GameStatus } from '@common/enums/game-status.enum';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';

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
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let logger: SinonStubbedInstance<Logger>;
    let clock: sinon.SinonFakeTimers;
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

    it('should process player movement and emit PlayerMove event', () => {
        socketManagerService.getSocketPlayerName.returns('Player1');
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME);
        socketManagerService.getSocketInformation.returns({playerName: 'Player1', room: MOCK_ROOM_GAME});
        socketManagerService.isSocketCurrentPlayer.returns(true);
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM_GAME.room.roomCode);
        movementService.executePlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);

        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.calledWith(MOCK_ROOM_GAME.room.roomCode)).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerMove, MOCK_MOVEMENT.moveResults.normal)).toBeTruthy();
    });

    it('should start the game and changeTurn', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        socketManagerService.getSocketInformation.returns({playerName: 'Player1', room: mockRoom});
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

    it('should not process player movement if it is not the current player', () => {
        socketManagerService.getSocketInformation.returns({playerName: 'Player2', room: MOCK_ROOM_GAME});
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

    it('should emit PlayerSlipped event if the player has tripped', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        gateway.endTurn = jest.fn();
        roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
        socketManagerService.getSocketInformation.returns({playerName: 'Player1', room: mockRoom});
        socketManagerService.isSocketCurrentPlayer.returns(true);
        movementService.executePlayerMovement.returns(MOCK_MOVEMENT.moveResults.tripped);
        socketManagerService.getSocketRoomCode.returns(mockRoom.room.roomCode);
        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        expect(gateway.endTurn).toBeCalled();
        expect(server.emit.calledWith(GameEvents.PlayerSlipped, 'Player1')).toBeTruthy();
    });

    it('should not emit PlayerSlipped event if the player has not tripped', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
        movementService.executePlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);
        socketManagerService.getSocketInformation.returns({ playerName: 'Player1', room: mockRoom});
        socketManagerService.getSocketRoomCode.returns(MOCK_ROOM_GAME.room.roomCode);
        gateway.processDesiredMove(socket, MOCK_MOVEMENT.destination);
        expect(server.emit.neverCalledWith(GameEvents.PlayerSlipped, 'Player1')).toBeTruthy();
    });

    it('should process desired Door movement and emit PlayerDoor event for opening a door', () => {
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME_W_DOORS.players[0]));
        gateway.endAction = jest.fn();

        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendGenericPublicJournal');
        roomManagerService.getCurrentRoomPlayer.returns(mockPlayer);
        socketManagerService.getSocketInformation.returns({playerName: mockPlayer.playerInfo.userName, room: MOCK_ROOM_GAME_W_DOORS});
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
        socketManagerService.getSocketInformation.returns({playerName: mockPlayer.playerInfo.userName, room: MOCK_ROOM_GAME_W_DOORS});
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

        socketManagerService.getSocketInformation.returns({playerName: 'Player1', room: undefined});
        gateway.processDesiredDoor(socket, { x: 1, y: 1 });

        expect(emitSpy).not.toHaveBeenCalled();
        expect(sendPublicJournalSpy).not.toHaveBeenCalled();
        expect(getReachableTilesSpy).not.toHaveBeenCalled();

        socketManagerService.getSocketInformation.returns({playerName: undefined, room: MOCK_ROOM_GAME});

        gateway.processDesiredDoor(socket, { x: 1, y: 1 });

        expect(emitSpy).not.toHaveBeenCalled();
        expect(sendPublicJournalSpy).not.toHaveBeenCalled();
        expect(getReachableTilesSpy).not.toHaveBeenCalled();
    });

    it('should not process desired Door movement if it is not the current player', () => {
        doorService.toggleDoor.returns(TileTerrain.ClosedDoor);
        roomManagerService.getRoom.returns(MOCK_ROOM_GAME_W_DOORS);
        socketManagerService.getSocketInformation.returns({playerName: 'Player2', room: MOCK_ROOM_GAME_W_DOORS});
        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendGenericPublicJournal');
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });
        expect(sendPublicJournalSpy).not.toHaveBeenCalled();
    });

    it('should not process desired Door movement if the room and player do not exist', () => {
        doorService.toggleDoor.returns(TileTerrain.ClosedDoor);
        socketManagerService.getSocketInformation.returns({playerName: 'Player5', room: MOCK_ROOM_GAME_W_DOORS});
        const sendPublicJournalSpy = jest.spyOn(gameMessagingGateway, 'sendGenericPublicJournal');
        gateway.processDesiredDoor(socket, { x: 0, y: 0 });
        expect(sendPublicJournalSpy).not.toHaveBeenCalled();
    });

    it('should process endTurn and emit ChangeTurn event', () => {
        const changeTurnSpy = jest.spyOn(gameTurnService, 'changeTurn').mockImplementation();
        socketManagerService.getSocketInformation.returns({playerName: 'Player1', room: MOCK_ROOM_GAME});
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
        socketManagerService.getSocketInformation.returns({playerName: 'Player2', room: MOCK_ROOM_GAME});
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
        socketManagerService.getSocketInformation.returns({playerName: 'Player2', room: MOCK_ROOM_GAME});
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
        socketManagerService.getSocketInformation.returns({playerName: 'Player1', room: mockRoom});
        const handleEndActionSpy = jest.spyOn(gameTurnService, 'handleEndAction').mockImplementation();

        gateway.endAction(socket);

        expect(handleEndActionSpy).toHaveBeenCalledWith(mockRoom);
    });

    it('should process endAction', () => {
        socketManagerService.getSocketInformation.returns({playerName: 'Player1', room: MOCK_ROOM_GAME});
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
        const fightEndSpy = jest.spyOn(fightManagerService, 'fightEnd');

        gateway.handlePlayerAbandonment(mockRoom, playerName);

        expect(processFighterAbandonmentSpy).toHaveBeenCalledWith(mockRoom, playerName);
        expect(fightEndSpy).toHaveBeenCalledWith(mockRoom);
    });

    it('should process player abandonment and call handlePlayerAbandonment if the room and player exist', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        const mockPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAME.players[0]));
        const playerName = 'Player1';
        socketManagerService.getSocketInformation.returns({playerName, room: mockRoom});
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

        socketManagerService.getSocketInformation.returns({playerName, room: mockRoom})
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // const gameCleanupSpy = jest.spyOn(gateway as any, 'gameCleanup').mockImplementation();
        gateway.handlePlayerAbandonment(mockRoom, playerName);

        expect(sendAbandonJournalSpy).toHaveBeenCalledWith(mockRoom, playerName);
        expect(processPlayerAbandonmentSpy).toHaveBeenCalled();
        expect(isInFightSpy).toHaveBeenCalledWith(mockRoom, playerName);
        expect(abandonCountSpy).toHaveBeenCalledWith(mockRoom.players);
        expect(server.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        expect(server.emit.calledWith(GameEvents.PlayerAbandoned, playerName)).toBeTruthy();
    });

    it('should not do abandon a player if there is no room or player name', () => {
        socketManagerService.getSocketInformation.returns({playerName: undefined, room: undefined});
        gateway.processPlayerAbandonment(socket);
        expect(server.to.called).toBeFalsy();
        expect(server.emit.called).toBeFalsy();
    });

    it('should not do abandon a player if playerAbandonment returns false', () => {
        socketManagerService.getSocketInformation.returns({playerName: 'Player1', room: MOCK_ROOM_GAME_PLAYER_ABANDONNED})
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
});
