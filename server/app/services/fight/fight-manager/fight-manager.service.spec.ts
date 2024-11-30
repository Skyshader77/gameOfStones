import {
    MOCK_ATTACK_RESULT,
    MOCK_FIGHTER_AI_ONE,
    MOCK_ROOM_AIS,
    MOCK_ROOM_COMBAT,
    MOCK_ROOM_COMBAT_ABANDONNED,
    MOCK_TIMER_FIGHT,
} from '@app/constants/combat.test.constants';
import { TIMER_RESOLUTION_MS, TimerDuration } from '@app/constants/time.constants';
import { MAX_AI_FIGHT_ACTION_DELAY, MIN_AI_FIGHT_ACTION_DELAY } from '@app/constants/virtual-player.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { RoomGame } from '@app/interfaces/room-game';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { VirtualPlayerHelperService } from '@app/services/virtual-player-helper/virtual-player-helper.service';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
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
    let mockRoom: RoomGame;
    beforeEach(async () => {
        gameTimeService = createStubInstance(GameTimeService);
        messagingGateway = createStubInstance(MessagingGateway);
        socketManagerService = createStubInstance(SocketManagerService);
        fightService = createStubInstance(FightLogicService);
        itemManagerService = createStubInstance(ItemManagerService);
        pathfindingService = createStubInstance(PathFindingService);
        virtualHelperService = createStubInstance(VirtualPlayerHelperService);
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
            ],
        }).compile();

        service = module.get<FightManagerService>(FightManagerService);
        mockSocket = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
        mockServer = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;

        mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_COMBAT)) as RoomGame;
        mockRoom.game.fight.timer = MOCK_TIMER_FIGHT;
        jest.useFakeTimers();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        jest.useRealTimers();
    });

    describe('startFight', () => {
        it('should initialize and start a fight', () => {
            socketManagerService.getGatewayServer.returns(mockServer);
            fightService.isFightValid.returns(true);
            fightService.initializeFight.returns(void 0);
            gameTimeService.getInitialTimer.returns(MOCK_TIMER_FIGHT);
            const mockSubscription = { subscribe: sinon.stub() };
            gameTimeService.getTimerSubject.returns(mockSubscription as unknown as Observable<number>);

            service.startFight(mockRoom, 'Player2');

            expect(fightService.initializeFight.calledOnce).toBeTruthy();
            expect(gameTimeService.stopTimer.calledOnce).toBeTruthy();
            expect(mockServer.to.called).toBeTruthy();
            expect(messagingGateway.sendGenericPublicJournal.calledWith(mockRoom, JournalEntry.FightStart)).toBeTruthy();
        });
    });

    describe('startFightTurn', () => {
        it('should emit StartFightTurn to fighters with the current fighter and time', () => {
            fightService.nextFightTurn.returns('Player1');
            fightService.getTurnTime.returns(TimerDuration.FightTurnEvasion);
            socketManagerService.getPlayerSocket.returns(mockSocket as Socket);
            service.startFightTurn(mockRoom);
            mockRoom.game.fight.fighters.forEach(() => {
                expect(mockSocket.emit.called).toBeTruthy();
            });
            expect(gameTimeService.startTimer.calledWith(mockRoom.game.fight.timer, TimerDuration.FightTurnEvasion)).toBeTruthy();
        });
    });

    describe('fighterAttack', () => {
        it('should emit FighterAttack with attack result to all fighters', () => {
            fightService.attack.returns(MOCK_ATTACK_RESULT);
            socketManagerService.getPlayerSocket.returns(mockSocket as Socket);
            service.fighterAttack(mockRoom);
            mockRoom.game.fight.fighters.forEach(() => {
                expect(mockSocket.emit.called).toBeTruthy();
            });
        });
    });

    describe('fighterEscape', () => {
        it('should emit FighterEvade with escape result to all fighters', () => {
            const evasionSuccessful = true;
            fightService.escape.returns(evasionSuccessful);
            socketManagerService.getPlayerSocket.returns(mockSocket as Socket);
            service.fighterEscape(mockRoom);
            mockRoom.game.fight.fighters.forEach(() => {
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

    describe('fightEnd', () => {
        it('should stop timer, unsubscribe, and emit FightEnd', () => {
            socketManagerService.getGatewayServer.returns(mockServer);
            mockRoom.game.fight.timer.timerSubscription = { unsubscribe: sinon.stub() } as unknown as Subscription;
            service.fightEnd(mockRoom);
            expect(gameTimeService.stopTimer.calledOnce).toBeTruthy();
            expect(messagingGateway.sendGenericPublicJournal.calledWith(mockRoom, JournalEntry.FightEnd)).toBeTruthy();
            expect(mockServer.to.called).toBeTruthy();
        });
    });

    describe('remainingFightTime', () => {
        it('should emit remaining time to all fighters and trigger attack if counter reaches 0 ', () => {
            mockRoom.game.fight.timer.counter = 0;
            socketManagerService.getPlayerSocket.returns(mockSocket as Socket);
            service.remainingFightTime(mockRoom, 0);
            mockRoom.game.fight.fighters.forEach(() => {
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
            const isInFight = service.isInFight(mockRoom, 'Player1');
            expect(isInFight).toBeTruthy();
        });

        it('should return false if fighter is not in the fight', () => {
            const isInFight = service.isInFight(mockRoom, 'nonexistent');
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
            defensiveAI.playerInfo.role = PlayerRole.DefensiveAI;
            room.game.fight.numbEvasionsLeft = [1, 1];

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
});
