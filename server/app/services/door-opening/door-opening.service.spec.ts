import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import { DoorOpeningService } from './door-opening.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Server } from 'socket.io';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import * as sinon from 'sinon';
describe('DoorOpeningService', () => {
    let doorOpeningService: DoorOpeningService;
    let server: SinonStubbedInstance<Server>;
    let socketManagerService: sinon.SinonStubbedInstance<SocketManagerService>;
    let roomManagerService: sinon.SinonStubbedInstance<RoomManagerService>;
    beforeEach(async () => {
        server = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
        socketManagerService = createStubInstance<SocketManagerService>(SocketManagerService);
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DoorOpeningService,
                {
                    provide: RoomManagerService,
                    useValue: roomManagerService,
                },
                {
                    provide: GameStatsService,
                    useValue: {
                        processDoorToggleStats: jest.fn(),
                    },
                },
                {
                    provide: SocketManagerService,
                    useValue: socketManagerService,
                },
            ],
        }).compile();
        doorOpeningService = module.get<DoorOpeningService>(DoorOpeningService);
    });

    it('should be defined', () => {
        expect(doorOpeningService).toBeDefined();
    });

    it('should open a closed door', () => {
        const doorPosition: Vec2 = { x: 0, y: 0 };
        const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.trapped));
        roomManagerService.getCurrentRoomPlayer.returns(mockRoomGame.players[0]);
        socketManagerService.getGatewayServer.returns(server);
        const result = doorOpeningService.toggleDoor(mockRoomGame, doorPosition);

        expect(mockRoomGame.game.map.mapArray[0][0]).toBe(TileTerrain.OpenDoor);
        expect(result).toBe(TileTerrain.OpenDoor);
        expect(server.to.calledWith(mockRoomGame.room.roomCode)).toBeTruthy();
    });

    it('should close an open door', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 };
        const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.untrapped));
        roomManagerService.getCurrentRoomPlayer.returns(MOCK_ROOM_GAMES.untrapped.players[0]);
        socketManagerService.getGatewayServer.returns(server);
        const result = doorOpeningService.toggleDoor(mockRoomGame, doorPosition);

        expect(mockRoomGame.game.map.mapArray[1][1]).toBe(TileTerrain.ClosedDoor);
        expect(result).toBe(TileTerrain.ClosedDoor);
        expect(server.to.calledWith(MOCK_ROOM_GAMES.untrapped.room.roomCode)).toBeTruthy();
    });

    it('should return undefined if the terrain is not a door', () => {
        const doorPosition: Vec2 = { x: 1, y: 0 };

        const result = doorOpeningService.toggleDoor(MOCK_ROOM_GAMES.trapped, doorPosition);

        expect(result).toBeUndefined();
    });

    it('should not close a door if another player is there', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 };
        const result = doorOpeningService.toggleDoor(MOCK_ROOM_GAMES.untrappedTwoPlayers, doorPosition);

        expect(result).toBeUndefined();
    });
});
