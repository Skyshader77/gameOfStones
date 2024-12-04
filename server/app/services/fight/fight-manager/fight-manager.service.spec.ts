/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    MOCK_ATTACK_RESULT,
    MOCK_FIGHTER_AI_ONE,
    MOCK_ROOM_AIS,
    MOCK_ROOM_COMBAT,
    MOCK_ROOM_COMBAT_ABANDONNED,
    MOCK_TIMER_FIGHT,
} from '@app/constants/combat.test.constants';
import { MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { TIMER_RESOLUTION_MS } from '@app/constants/time.constants';
import { MAX_AI_FIGHT_ACTION_DELAY, MIN_AI_FIGHT_ACTION_DELAY } from '@app/constants/virtual-player.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { GameTimer } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { ItemManagerService } from '@app/services/item/item-manager/item-manager.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { VirtualPlayerHelperService } from '@app/services/virtual-player-helper/virtual-player-helper.service';
import * as utils from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { FightResult } from '@common/interfaces/fight';
import { DeadPlayerPayload, Player, PlayerInfo } from '@common/interfaces/player';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable, Subscription } from 'rxjs';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { FightManagerService } from './fight-manager.service';

describe('FightManagerService', () => {
    let service: FightManagerService;
    let gameTimeService: SinonStubbedInstance<GameTimeService>;
    let messagingGateway: SinonStubbedInstance<MessagingGateway>;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    let fightService: SinonStubbedInstance<FightLogicService>;
    let itemManagerService: SinonStubbedInstance<ItemManagerService>;
    let mockServer: SinonStubbedInstance<Server>;
    let mockSocket: SinonStubbedInstance<Socket>;
    let pathfindingService: SinonStubbedInstance<PathFindingService>;
    let virtualHelperService: SinonStubbedInstance<VirtualPlayerHelperService>;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let mockRoomGame: RoomGame;
    beforeEach(async () => {
        gameTimeService = createStubInstance(GameTimeService);
        messagingGateway = createStubInstance(MessagingGateway);
        socketManagerService = createStubInstance(SocketManagerService);
        fightService = createStubInstance(FightLogicService);
        itemManagerService = createStubInstance(ItemManagerService);
        pathfindingService = createStubInstance(PathFindingService);
        virtualHelperService = createStubInstance(VirtualPlayerHelperService);
        roomManagerService = createStubInstance(RoomManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FightManagerService,
                { provide: GameTimeService, useValue: gameTimeService },
                { provide: MessagingGateway, useValue: messagingGateway },
                { provide: SocketManagerService, useValue: socketManagerService },
                { provide: FightLogicService, useValue: fightService },
                { provide: ItemManagerService, useValue: itemManagerService },
                { provide: PathFindingService, useValue: pathfindingService },
                { provide: VirtualPlayerHelperService, useValue: virtualHelperService },
                { provide: RoomManagerService, useValue: roomManagerService },
            ],
        }).compile();

        service = module.get<FightManagerService>(FightManagerService);
        mockSocket = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
        mockServer = {
            emit: sinon.stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;

        mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
        mockRoomGame.game.fight.timer = MOCK_TIMER_FIGHT;
        jest.useFakeTimers();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        jest.useRealTimers();
    });

    describe('startFight', () => {
        it('should initialize the fight and start a fight turn if two AIs are fighting', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_AIS)) as RoomGame;
            const opponentName = 'AI_Opponent';

            fightService.isFightValid.returns(true);
            virtualHelperService.areTwoAIsFighting.returns(true);
            const initializeFightStateSpy = jest.spyOn(service as any, 'initializeFightState').mockImplementation();
            const broadcastFightStartSpy = jest.spyOn(service as any, 'broadcastFightStart').mockImplementation();
            const startFightTurnSpy = jest.spyOn(service, 'startFightTurn').mockImplementation();

            service.startFight(mockRoom, opponentName);

            expect(fightService.isFightValid.calledWith(mockRoom, opponentName)).toBeTruthy();
            expect(initializeFightStateSpy).toHaveBeenCalledWith(mockRoom, opponentName);
            expect(broadcastFightStartSpy).toHaveBeenCalledWith(mockRoom);
            expect(virtualHelperService.areTwoAIsFighting.calledWith(mockRoom)).toBeTruthy();
            expect(startFightTurnSpy).toHaveBeenCalledWith(mockRoom);
            expect(mockRoom.game.hasPendingAction).toBeTruthy();
        });
    });

    describe('handleDesireAttack', () => {
        it('should trigger an attack if the player is the current fighter', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            const currentPlayer = 'Player1';
            mockRoom.game.fight.currentFighter = 0;

            fightService.isCurrentFighter.returns(true);
            const fighterAttackSpy = jest.spyOn(service, 'fighterAttack').mockImplementation();

            service.handleDesireAttack(mockRoom, currentPlayer);

            expect(fightService.isCurrentFighter.calledWith(mockRoom.game.fight, currentPlayer)).toBeTruthy();
            expect(mockRoom.game.fight.hasPendingAction).toBeTruthy();
            expect(fighterAttackSpy).toHaveBeenCalledWith(mockRoom);
        });

        it('should not trigger an attack if the player is not the current fighter', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            const currentPlayer = 'Player1';
            mockRoom.game.fight.currentFighter = 1;

            fightService.isCurrentFighter.returns(false);
            const fighterAttackSpy = jest.spyOn(service, 'fighterAttack').mockImplementation();

            service.handleDesireAttack(mockRoom, currentPlayer);

            expect(fightService.isCurrentFighter.calledWith(mockRoom.game.fight, currentPlayer)).toBeTruthy();
            expect(mockRoom.game.fight.hasPendingAction).toBeFalsy();
            expect(fighterAttackSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleEndFightAction', () => {
        it('should do nothing if fight has no pending action', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            mockRoom.game.fight.hasPendingAction = false;

            const handleFightCompletionSpy = jest.spyOn(service as any, 'handleFightCompletion');
            const startFightTurnSpy = jest.spyOn(service, 'startFightTurn');

            service.handleEndFightAction(mockRoom, 'Player1');

            expect(handleFightCompletionSpy).not.toHaveBeenCalled();
            expect(startFightTurnSpy).not.toHaveBeenCalled();
        });

        it('should do nothing if fight has pending action but player is not the current fighter', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            mockRoom.game.fight.hasPendingAction = true;
            mockRoom.game.fight.isFinished = false;

            const handleFightCompletionSpy = jest.spyOn(service as any, 'handleFightCompletion');
            const startFightTurnSpy = jest.spyOn(service, 'startFightTurn');

            fightService.isCurrentFighter.returns(false);
            virtualHelperService.isCurrentFighterAI.returns(false);

            service.handleEndFightAction(mockRoom, 'Player2');

            expect(handleFightCompletionSpy).not.toHaveBeenCalled();
            expect(startFightTurnSpy).not.toHaveBeenCalled();
        });

        it('should call handleFightCompletion when the fight is finished and current fighter is player', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            mockRoom.game.fight.hasPendingAction = true;
            mockRoom.game.fight.isFinished = true;

            socketManagerService.getGatewayServer.returns(mockServer);

            const handleFightCompletionSpy = jest.spyOn(service as any, 'handleFightCompletion');
            const startFightTurnSpy = jest.spyOn(service, 'startFightTurn');

            fightService.isCurrentFighter.returns(true);
            virtualHelperService.isCurrentFighterAI.returns(false);

            service.handleEndFightAction(mockRoom, 'Player1');

            expect(handleFightCompletionSpy).toHaveBeenCalled();
            expect(startFightTurnSpy).not.toHaveBeenCalled();
        });

        it('should call startFightTurn when the fight is not finished and current fighter is player', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            mockRoom.game.fight.hasPendingAction = true;
            mockRoom.game.fight.isFinished = false;

            const handleFightCompletionSpy = jest.spyOn(service as any, 'handleFightCompletion');
            const startFightTurnSpy = jest.spyOn(service, 'startFightTurn');

            fightService.isCurrentFighter.returns(true);
            virtualHelperService.isCurrentFighterAI.returns(false);

            service.handleEndFightAction(mockRoom, 'Player1');

            expect(handleFightCompletionSpy).not.toHaveBeenCalled();
            expect(startFightTurnSpy).toHaveBeenCalledWith(mockRoom);
        });

        it('should call handleFightCompletion when the current fighter is an AI and fight is finished', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            mockRoom.game.fight.hasPendingAction = true;
            mockRoom.game.fight.isFinished = true;

            socketManagerService.getGatewayServer.returns(mockServer);
            const handleFightCompletionSpy = jest.spyOn(service as any, 'handleFightCompletion');
            const startFightTurnSpy = jest.spyOn(service, 'startFightTurn');

            fightService.isCurrentFighter.returns(false);
            virtualHelperService.isCurrentFighterAI.returns(true);

            service.handleEndFightAction(mockRoom, 'AIPlayer1');

            expect(handleFightCompletionSpy).toHaveBeenCalled();
            expect(startFightTurnSpy).not.toHaveBeenCalled();
        });

        it('should call startFightTurn when the current fighter is an AI and fight is not finished', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            mockRoom.game.fight.hasPendingAction = true;
            mockRoom.game.fight.isFinished = false;

            const handleFightCompletionSpy = jest.spyOn(service as any, 'handleFightCompletion');
            const startFightTurnSpy = jest.spyOn(service, 'startFightTurn');

            fightService.isCurrentFighter.returns(false);
            virtualHelperService.isCurrentFighterAI.returns(true);

            service.handleEndFightAction(mockRoom, 'AIPlayer1');

            expect(handleFightCompletionSpy).not.toHaveBeenCalled();
            expect(startFightTurnSpy).toHaveBeenCalledWith(mockRoom);
        });
    });

    // it('should emit PlayerDead event when loserPlayer exists', () => {
    //     const room: RoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT));
    //     const fight = room.game.fight;
    //     fight.result = { loser: 'losingPlayer' } as FightResult;
    //     room.players = [{ playerInfo: { userName: 'winningPlayer' } } as Player, { playerInfo: { userName: 'losingPlayer' } } as Player];

    //     jest.spyOn(service as any, 'handlePlayerLoss').mockImplementation();
    //     jest.spyOn(service as any, 'resetFightersHealth').mockImplementation();
    //     jest.spyOn(service as any, 'fightEnd').mockImplementation();
    //     roomManagerService.getCurrentRoomPlayer.returns(room.players[1]);
    //     service['handleFightCompletion'](room);

    //     expect(mockServer.emit.called).toBeTruthy();
    // });

    describe('beginFightTurn', () => {
        it('should call startVirtualPlayerFightTurn when the fighter is a virtual player and matches nextFighterName', () => {
            const mockRoom: RoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT));
            mockRoom.game.fight.fighters = [{ playerInfo: { userName: 'virtualFighter123' } } as Player];
            const nextFighterName = 'virtualFighter123';
            const virtualFighter = mockRoom.game.fight.fighters.find((fighter) => fighter.playerInfo.userName === nextFighterName);

            jest.spyOn(utils, 'isPlayerHuman').mockReturnValue(false);
            const startVirtualPlayerFightTurnSpy = jest.spyOn(service as any, 'startVirtualPlayerFightTurn');

            service['beginFightTurn'](mockRoom, nextFighterName);

            expect(startVirtualPlayerFightTurnSpy).toHaveBeenCalledWith(mockRoom, virtualFighter);
        });

        it('should call socket.emit when the fighter is a human player', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            const nextFighterName = 'humanPlayer123';
            const turnTime = 30;

            jest.spyOn(utils, 'isPlayerHuman').mockReturnValue(true);

            jest.spyOn(socketManagerService, 'getPlayerSocket').mockReturnValue(mockSocket);

            jest.spyOn(fightService, 'getTurnTime').mockReturnValue(turnTime);

            service['beginFightTurn'](mockRoom, nextFighterName);

            expect(mockSocket.emit.calledWith(GameEvents.StartFightTurn, { currentFighter: nextFighterName, time: turnTime })).toBeTruthy();
        });
    });

    describe('startFightTurn', () => {
        it('should handle the case where two AIs are fighting', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            mockRoom.game.fight.hasPendingAction = false;
            mockRoom.game.fight.fighters = [
                { playerInfo: { role: PlayerRole.AggressiveAI } as PlayerInfo } as Player,
                { playerInfo: { role: PlayerRole.DefensiveAI } as PlayerInfo } as Player,
            ];

            fightService.nextFightTurn.returns('Player1');
            virtualHelperService.areTwoAIsFighting.returns(true);
            const determineWhichAILostSpy = jest.spyOn(service as any, 'determineWhichAILost').mockImplementation();
            const handleEndFightActionSpy = jest.spyOn(service, 'handleEndFightAction').mockImplementation();

            service.startFightTurn(mockRoom);

            expect(mockRoom.game.fight.hasPendingAction).toBe(true);
            expect(determineWhichAILostSpy).toHaveBeenCalledWith(mockRoom.game.fight.fighters, mockRoom);
            expect(handleEndFightActionSpy).toHaveBeenCalledWith(mockRoom, 'Player1');
        });
    });

    describe('fighterAttack', () => {
        it('should emit FighterAttack with attack result to all fighters', () => {
            fightService.attack.returns(MOCK_ATTACK_RESULT);
            socketManagerService.getPlayerSocket.returns(mockSocket as Socket);
            service.fighterAttack(mockRoomGame);
            mockRoomGame.game.fight.fighters.forEach(() => {
                expect(mockSocket.emit.called).toBeTruthy();
            });
        });
    });

    describe('fighterEscape', () => {
        it('should emit FighterEvade with escape result to all fighters', () => {
            const evasionSuccessful = true;
            fightService.escape.returns(evasionSuccessful);
            socketManagerService.getPlayerSocket.returns(mockSocket as Socket);
            service.fighterEscape(mockRoomGame);
            mockRoomGame.game.fight.fighters.forEach(() => {
                expect(mockSocket.emit.called).toBeTruthy();
            });
        });
    });

    it('should return true when the fight has a clear loser', () => {
        const mockRoomAbandonned = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT_ABANDONNED)) as RoomGame;
        mockRoomAbandonned.game.fight.result.loser = 'Player2';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (service as any).hasLostFight(mockRoomAbandonned);
        expect(result).toBe(false);
    });

    describe('hasLostFight', () => {
        it('should return false if room.game.fight is not present', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
            mockRoom.game.fight = null;

            const result = service.hasLostFight(mockRoom);

            expect(result).toBe(false);
        });
    });

    describe('setupFightTimer', () => {
        it('should initialize the fight timer, start the fight turn, and subscribe to timer updates', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
            const mockTimer = { counter: 10, timerSubscription: null } as GameTimer;

            gameTimeService.getInitialTimer.returns(mockTimer);
            gameTimeService.getTimerSubject.returns(
                new Observable((observer) => {
                    observer.next(9);
                    observer.complete();
                }),
            );

            const startFightTurnSpy = jest.spyOn(service, 'startFightTurn');
            const remainingFightTimeSpy = jest.spyOn(service, 'remainingFightTime');

            service.setupFightTimer(mockRoom);

            expect(mockRoom.game.fight.timer).toEqual(mockTimer);

            expect(startFightTurnSpy).toHaveBeenCalledWith(mockRoom);

            expect(mockTimer.timerSubscription).not.toBeNull();
            expect(remainingFightTimeSpy).toHaveBeenCalledWith(mockRoom, 9);
        });
    });

    describe('fightEnd', () => {
        it('should stop timer, unsubscribe, and emit FightEnd', () => {
            socketManagerService.getGatewayServer.returns(mockServer);
            mockRoomGame.game.fight.timer.timerSubscription = { unsubscribe: sinon.stub() } as unknown as Subscription;
            service.fightEnd(mockRoomGame);
            expect(gameTimeService.stopTimer.calledOnce).toBeTruthy();
            expect(messagingGateway.sendGenericPublicJournal.calledWith(mockRoomGame, JournalEntry.FightEnd)).toBeTruthy();
            expect(mockServer.to.called).toBeTruthy();
        });
    });

    describe('remainingFightTime', () => {
        it('should emit remaining time to all fighters and trigger attack if counter reaches 0 ', () => {
            mockRoomGame.game.fight.timer.counter = 0;
            socketManagerService.getPlayerSocket.returns(mockSocket as Socket);
            service.remainingFightTime(mockRoomGame, 0);
            mockRoomGame.game.fight.fighters.forEach(() => {
                expect(mockSocket.emit.called).toBeTruthy();
            });
            jest.advanceTimersByTime(TIMER_RESOLUTION_MS);
            expect(fightService.attack.calledOnce).toBeTruthy();
        });

        it('should not emit remaining time if there are no fighters ', () => {
            const mockRoomNoFight = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT_ABANDONNED)) as RoomGame;
            mockRoomNoFight.game.fight.fighters = null;
            service.remainingFightTime(mockRoomNoFight, 0);
            expect(mockSocket.emit.called).toBeFalsy();
            expect(fightService.attack.calledOnce).toBeFalsy();
        });

        it('should not emit RemainingTime if fighters are not defined', () => {
            const room = MOCK_ROOM_GAME;
            const emitSpy = jest.spyOn(service['socketManagerService'], 'getPlayerSocket').mockReturnValue(null);

            service['remainingFightTime'](room, 10);

            expect(emitSpy).not.toHaveBeenCalled();
        });
    });

    it('should return true when evasions left, defensive AI, and injured', () => {
        const fighter = {
            playerInfo: { role: PlayerRole.DefensiveAI },
            playerInGame: { remainingHp: 50, baseAttributes: { hp: 100 } },
        } as Player;
        const room = { game: { fight: { numbEvasionsLeft: [1] } } } as RoomGame;
        const fighterIndex = 0;

        const result = service['shouldEscape'](fighter, fighterIndex, room);

        expect(result).toBe(true);
    });

    describe('processFighterAbandonment', () => {
        it('should mark the fight as finished and set result with winner and loser', () => {
            const mockRoomAbandonned = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT_ABANDONNED)) as RoomGame;
            const endSpy = jest.spyOn(service, 'fightEnd').mockImplementation();
            service.processFighterAbandonment(mockRoomAbandonned, 'Player2');

            expect(endSpy).toHaveBeenCalled();
        });
    });

    describe('isInFight', () => {
        it('should return true if fighter is in the fight', () => {
            const isInFight = service.isInFight(mockRoomGame, 'Player1');
            expect(isInFight).toBeTruthy();
        });

        it('should return false if fighter is not in the fight', () => {
            const isInFight = service.isInFight(mockRoomGame, 'nonexistent');
            expect(isInFight).toBeFalsy();
        });

        it('should return false if there is no Fight', () => {
            const mockRoomNoFight = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT_ABANDONNED)) as RoomGame;
            mockRoomNoFight.game.fight = undefined;
            const isInFight = service.isInFight(mockRoomNoFight, 'nonexistent');
            expect(isInFight).toBeFalsy();
        });
    });

    describe('determineWhichAILost', () => {
        it('should randomly select a loser and winner from two AIs', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_AIS)) as RoomGame;
            virtualHelperService.determineAIBattleWinner.returns({ loserIndex: 0, winnerIndex: 1 });
            service['determineWhichAILost'](room.game.fight.fighters, room);
            sinon.assert.called(fightService.setFightResult);
        });
    });

    describe('startVirtualPlayerFightTurn', () => {
        it('should trigger attack for aggressive AI after random delay', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_AIS)) as RoomGame;
            const aggressiveAI = JSON.parse(JSON.stringify(MOCK_FIGHTER_AI_ONE));
            aggressiveAI.playerInfo.role = PlayerRole.AggressiveAI;

            service['startVirtualPlayerFightTurn'](room, aggressiveAI);

            jest.advanceTimersByTime(MAX_AI_FIGHT_ACTION_DELAY);

            expect(room.game.fight.hasPendingAction).toBe(true);
        });

        it('should trigger escape for defensive AI with available evasions', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_AIS)) as RoomGame;
            const defensiveAI = JSON.parse(JSON.stringify(MOCK_FIGHTER_AI_ONE));
            jest.spyOn(service as any, 'shouldEscape').mockReturnValue(true);

            service['startVirtualPlayerFightTurn'](room, defensiveAI);

            jest.advanceTimersByTime(MAX_AI_FIGHT_ACTION_DELAY);

            expect(room.game.fight.hasPendingAction).toBe(true);
        });

        it('should trigger attack for defensive AI with no evasions left', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_AIS)) as RoomGame;
            const defensiveAI = JSON.parse(JSON.stringify(MOCK_FIGHTER_AI_ONE));
            defensiveAI.playerInfo.role = PlayerRole.DefensiveAI;
            room.game.fight.numbEvasionsLeft = [0, 0];

            service['startVirtualPlayerFightTurn'](room, defensiveAI);

            jest.advanceTimersByTime(MAX_AI_FIGHT_ACTION_DELAY);

            expect(room.game.fight.hasPendingAction).toBe(true);
        });

        it('should delay action within MIN and MAX delay range', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_AIS)) as RoomGame;
            const ai = MOCK_FIGHTER_AI_ONE;
            const mockMath = Object.create(global.Math);
            const COIN_TOSS = 0.5;
            mockMath.random = () => COIN_TOSS;
            global.Math = mockMath;

            service['startVirtualPlayerFightTurn'](room, ai);

            jest.advanceTimersByTime(MIN_AI_FIGHT_ACTION_DELAY - 1);
            expect(room.game.fight.hasPendingAction).toBe(true);
        });
    });

    it('should reset the loser attributes to their base values', () => {
        const loser = {
            playerInGame: {
                attributes: { attack: 10, defense: 10, speed: 10 },
                baseAttributes: { attack: 5, defense: 5, speed: 5 },
            },
            playerInfo: { userName: 'loser' },
        } as Player;

        service['resetLoserAttributes'](loser);

        expect(loser.playerInGame.attributes.attack).toBe(5);
        expect(loser.playerInGame.attributes.defense).toBe(5);
        expect(loser.playerInGame.attributes.speed).toBe(5);
    });

    it('should broadcast the fight start event', () => {
        const room = MOCK_ROOM_COMBAT;
        socketManagerService.getGatewayServer.returns(mockServer);

        service['broadcastFightStart'](room);

        expect(mockServer.emit.called).toBeTruthy();
    });

    it('should return the correct fight order', () => {
        const room = MOCK_ROOM_COMBAT;

        const fightOrder = service['getFightOrder'](room);

        expect(fightOrder).toEqual(['Player1', 'Player2']);
    });

    it('should initialize the fight state and stop the timer', () => {
        const room = MOCK_ROOM_COMBAT;
        const opponentName = 'opponent';

        const stopTimerSpy = jest.spyOn(service['gameTimeService'], 'stopTimer');
        const initializeFightSpy = jest.spyOn(service['fightService'], 'initializeFight');

        service['initializeFightState'](room, opponentName);

        expect(initializeFightSpy).toHaveBeenCalledWith(room, opponentName);
        expect(stopTimerSpy).toHaveBeenCalledWith(room.game.timer);
        expect(room.game.status).toBe(GameStatus.Fight);
    });

    it('should handle player loss and reset attributes', () => {
        const loserPlayer = {
            playerInfo: { userName: 'loser' },
            playerInGame: { attributes: { attack: 10, defense: 10, speed: 10 }, baseAttributes: { attack: 5, defense: 5, speed: 5 } },
        } as Player;
        const room = MOCK_ROOM_GAME;

        roomManagerService.getCurrentRoomPlayer.returns(loserPlayer);
        const resetAttributesSpy = jest.spyOn(service as any, 'resetLoserAttributes');
        const handlePlayerDeathSpy = jest
            .spyOn(service['itemManagerService'], 'handlePlayerDeath')
            .mockReturnValue([] as unknown as DeadPlayerPayload);

        const result = service['handlePlayerLoss'](loserPlayer, room);

        expect(resetAttributesSpy).toHaveBeenCalledWith(loserPlayer);
        expect(handlePlayerDeathSpy).toHaveBeenCalledWith(room, loserPlayer, null);
        expect(result).toEqual([[]]);
        expect(room.game.isCurrentPlayerDead).toBe(true);
    });
});
