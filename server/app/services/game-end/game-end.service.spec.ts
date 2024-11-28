import { MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING, MOCK_ROOM_MULTIPLE_PLAYERS_WINNER } from '@app/constants/gameplay.test.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { GameEndService } from './game-end.service';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { MOCK_GAME_END_STATS } from '@common/constants/game-end-test.constants';
import { MOCK_ROOM_GAME, MOCK_TIMER, MOCK_GAME_END_NOTHING_OUTPUT } from '@app/constants/test.constants';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Subscription } from 'rxjs';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { Server } from 'socket.io';
import * as sinon from 'sinon';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';

describe('GameEndService', () => {
    let gameEndService: GameEndService;
    let server: SinonStubbedInstance<Server>;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    beforeEach(async () => {
        socketManagerService = createStubInstance<SocketManagerService>(SocketManagerService);
        server = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameEndService,
                {
                    provide: GameStatsService,
                    useValue: {
                        getGameEndStats: jest.fn().mockReturnValue(MOCK_GAME_END_STATS),
                    },
                },
                MessagingGateway,
                {
                    provide: MessagingGateway,
                    useValue: {
                        sendGenericPublicJournal: jest.fn(),
                    },
                },
                SocketManagerService,
                {
                    provide: SocketManagerService,
                    useValue: socketManagerService,
                },
            ],
        }).compile();
        gameEndService = module.get<GameEndService>(GameEndService);
    });

    describe('hasGameEnded', () => {
        it('should return the correct GameEndOutput when one player has three victories', () => {
            const room = MOCK_ROOM_MULTIPLE_PLAYERS_WINNER;
            const result = gameEndService['hasGameEnded'](room);
            expect(result).toEqual({
                hasEnded: true,
                winnerName: 'Player2',
                endStats: MOCK_GAME_END_STATS,
            });
        });

        it('should return the correct GameEndOutput when the game is not ended', () => {
            const room = MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING;

            const result = gameEndService['hasGameEnded'](room);
            expect(result).toEqual({
                hasEnded: false,
                winnerName: null,
                endStats: null,
            });
        });
    });

    describe('CTF Mode', () => {
        it('should return the correct GameEndOutput for CTF mode', () => {
            const room = {
                ...MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING,
                game: { ...MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING.game, mode: GameMode.CTF },
            };

            const result = gameEndService['hasGameEnded'](room);

            expect(result).toEqual({
                hasEnded: false,
                winnerName: null,
                endStats: null,
            });
        });
    });

    it('should emit EndGame event with end result and send public journals', () => {
        socketManagerService.getGatewayServer.returns(server);
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));
        mockRoom.game.timer = JSON.parse(JSON.stringify(MOCK_TIMER));
        mockRoom.game.timer.timerSubscription = { unsubscribe: jest.fn() } as unknown as Subscription;

        mockRoom.game.fight = {
            timer: { timerSubscription: { unsubscribe: jest.fn() } },
        };

        gameEndService.endGame(mockRoom, MOCK_GAME_END_NOTHING_OUTPUT);

        expect(server.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
        expect(
            server.emit.calledWith(GameEvents.EndGame, {
                winnerName: MOCK_GAME_END_NOTHING_OUTPUT.winnerName,
                endStats: MOCK_GAME_END_NOTHING_OUTPUT.endStats,
            }),
        ).toBeTruthy();
    });
});
