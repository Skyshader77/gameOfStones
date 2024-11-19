import { MOCK_ATTACK_RESULT, MOCK_ROOM_COMBAT, MOCK_ROOM_COMBAT_ABANDONNED, MOCK_TIMER_FIGHT } from '@app/constants/combat.test.constants';
import { TIMER_RESOLUTION_MS, TimerDuration } from '@app/constants/time.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { RoomGame } from '@app/interfaces/room-game';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable, Subscription } from 'rxjs';
import * as sinon from 'sinon';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { FightLogicService } from './fight-logic.service';
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
    let mockRoom: RoomGame;

    beforeEach(async () => {
        gameTimeService = createStubInstance(GameTimeService);
        messagingGateway = createStubInstance(MessagingGateway);
        socketManagerService = createStubInstance(SocketManagerService);
        fightService = createStubInstance(FightLogicService);
        itemManagerService = createStubInstance(ItemManagerService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FightManagerService,
                { provide: GameTimeService, useValue: gameTimeService },
                { provide: MessagingGateway, useValue: messagingGateway },
                { provide: SocketManagerService, useValue: socketManagerService },
                { provide: FightLogicService, useValue: fightService },
                { provide: ItemManagerService, useValue: itemManagerService },
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

            const remainingTimeSpy = jest.spyOn(service, 'remainingFightTime');

            service.startFight(mockRoom, 'Player2');

            expect(fightService.initializeFight.calledOnce).toBeTruthy();
            expect(gameTimeService.stopTimer.calledOnce).toBeTruthy();
            expect(mockServer.to.called).toBeTruthy();
            expect(messagingGateway.sendPublicJournal.calledWith(mockRoom, JournalEntry.FightStart)).toBeTruthy();
            const counterValue = 10;
            mockSubscription.subscribe.getCall(0).args[0](counterValue);

            expect(remainingTimeSpy).toHaveBeenCalledWith(mockRoom, counterValue);
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

    describe('fightEnd', () => {
        it('should stop timer, unsubscribe, and emit FightEnd', () => {
            socketManagerService.getGatewayServer.returns(mockServer);
            mockRoom.game.fight.timer.timerSubscription = { unsubscribe: sinon.stub() } as unknown as Subscription;
            service.fightEnd(mockRoom);
            expect(gameTimeService.stopTimer.calledOnce).toBeTruthy();
            expect(messagingGateway.sendPublicJournal.calledWith(mockRoom, JournalEntry.FightEnd)).toBeTruthy();
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
            service.processFighterAbandonment(mockRoomAbandonned, 'Player2');

            expect(mockRoomAbandonned.game.fight.isFinished).toBeTruthy();
            expect(mockRoomAbandonned.game.fight.result.winner).toEqual('Player1');
            expect(mockRoomAbandonned.game.fight.result.loser).toEqual('Player2');
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
});
