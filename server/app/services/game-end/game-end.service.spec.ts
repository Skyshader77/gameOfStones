import { MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING, MOCK_ROOM_MULTIPLE_PLAYERS_WINNER } from '@app/constants/gameplay.test.constants';
import { MOCK_GAME_END_NOTHING_OUTPUT, MOCK_ROOM_GAME, MOCK_TIMER } from '@app/constants/test.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { MOCK_GAME_END_STATS } from '@common/constants/game-end-test.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Test, TestingModule } from '@nestjs/testing';
import { Subscription } from 'rxjs';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameEndService } from './game-end.service';
import { RoomGame } from '@app/interfaces/room-game';
import { MAXIMUM_NUMBER_OF_VICTORIES } from '@app/constants/gameplay.constants';
import { ItemType } from '@common/enums/item-type.enum';

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

        it('should return the correct GameEndOutput for CTF mode', () => {
            const room = {
                ...JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING)),
                game: { ...MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING.game, mode: GameMode.CTF },
            } as RoomGame;

            room.players[0].playerInGame.currentPosition = room.players[0].playerInGame.startPosition;
            room.players[0].playerInGame.inventory = [ItemType.Flag];

            const result = gameEndService['hasGameEnded'](room);

            expect(result).toEqual({
                hasEnded: true,
                winnerName: room.players[0].playerInfo.userName,
                endStats: expect.anything(),
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

    it('should return true and call endGame when game has ended', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME)) as RoomGame;
        const endGameSpy = jest.spyOn(gameEndService, 'endGame').mockImplementation();
        mockRoom.players[0].playerInGame.winCount = MAXIMUM_NUMBER_OF_VICTORIES;
        const result = gameEndService.checkForGameEnd(mockRoom);
        expect(result).toBe(true);
        expect(endGameSpy).toHaveBeenCalled();
    });

    it('should return false and not call endGame when game has not ended', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAME)) as RoomGame;
        const result = gameEndService.checkForGameEnd(mockRoom);
        expect(result).toBe(false);
    });
});
