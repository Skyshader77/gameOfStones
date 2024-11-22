/* eslint-disable */
import { MOCK_ROOM_COMBAT } from '@app/constants/combat.test.constants';
import { MOCK_FIGHT, MOCK_ROOM, MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { GameGateway } from '@app/gateways/game/game.gateway';
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
import { Fight } from '@common/interfaces/fight';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { FightGateway } from './fight.gateway';

describe('FightGateway', () => {
    let gateway: FightGateway;
    let gameGateway: SinonStubbedInstance<GameGateway>;
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
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let logger: SinonStubbedInstance<Logger>;
    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        socket.data = {};
        gameGateway = createStubInstance<GameGateway>(GameGateway);
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
        server = {
            to: stub().returnsThis(),
            emit: stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
        stub(socket, 'rooms').value(MOCK_ROOM);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FightGateway,
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
                { provide: ItemManagerService, useValue: itemManagerService },
                { provide: GameGateway, useValue: gameGateway },
            ],
        }).compile();
        gateway = module.get<FightGateway>(FightGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should process desired Fight and emit EndGame event', () => {
        const startFightSpy = jest.spyOn(fightManagerService, 'startFight');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_COMBAT);
        socketManagerService.getSocketPlayerName.returns('Player1');

        gateway.processDesiredFight(socket, MOCK_ROOM_COMBAT.players[1].playerInGame.currentPosition);

        expect(startFightSpy).toBeCalled();
    });

    it('should not process start fight if it is not the current player', () => {
        const startFightSpy = jest.spyOn(fightManagerService, 'startFight');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_COMBAT);
        socketManagerService.getSocketPlayerName.returns('Player2');

        gateway.processDesiredFight(socket, MOCK_ROOM_COMBAT.players[0].playerInGame.currentPosition);

        expect(startFightSpy).not.toBeCalled();
    });

    it('should not process start fight if the player does not exist', () => {
        const startFightSpy = jest.spyOn(fightManagerService, 'startFight');
        socketManagerService.getSocketRoom.returns(MOCK_ROOM_COMBAT);
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.processDesiredFight(socket, MOCK_ROOM_COMBAT.players[0].playerInGame.currentPosition);
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

        gateway.processDesiredEvade(socket);

        expect(fighterEscapeSpy).toHaveBeenCalledWith(mockRoom);
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

    it('should not process EndFight Action if the room and player do not exist', () => {
        const startFightSpy = jest.spyOn(fightManagerService, 'startFight');
        socketManagerService.getSocketPlayerName.returns('Player5');
        gateway.processDesiredAttack(socket);
        expect(startFightSpy).not.toBeCalled();
    });

    it("should reset loser's position and HP for each fighter when the fight is finished, and emit reachable tiles for the winner", () => {
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

        gateway.processEndFightAction(socket);

        const loser = mockRoom.players.find((player) => player.playerInfo.userName === 'Player2');
        expect(loser?.playerInGame.currentPosition).toEqual(loser?.playerInGame.startPosition);

        mockRoom.game.fight.fighters.forEach((fighter) => {
            expect(fighter.playerInGame.remainingHp).toBe(fighter.playerInGame.attributes.hp);
        });

        expect(fightEndSpy).toHaveBeenCalledWith(mockRoom, expect.anything());
    });

    it('should return early when there is no room or no player', () => {
        socketManagerService.getSocketRoom.returns(undefined);
        socketManagerService.getSocketPlayerName.returns(undefined);

        const fightEndSpy = jest.spyOn(fightManagerService, 'fightEnd');
        const changeTurnSpy = jest.spyOn(gameTurnService, 'changeTurn');
        const startFightTurnSpy = jest.spyOn(fightManagerService, 'startFightTurn');

        gateway.processEndFightAction(socket);

        expect(fightEndSpy).not.toHaveBeenCalled();
        expect(changeTurnSpy).not.toHaveBeenCalled();
        expect(startFightTurnSpy).not.toHaveBeenCalled();
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
});
