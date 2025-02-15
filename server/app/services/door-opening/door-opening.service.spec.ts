import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { DoorOpeningService } from './door-opening.service';

describe('DoorOpeningService', () => {
    let service: DoorOpeningService;
    let server: SinonStubbedInstance<Server>;
    let socketManagerService: sinon.SinonStubbedInstance<SocketManagerService>;
    let roomManagerService: sinon.SinonStubbedInstance<RoomManagerService>;
    let virtualStateService: sinon.SinonStubbedInstance<VirtualPlayerStateService>;
    beforeEach(async () => {
        server = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
        socketManagerService = createStubInstance<SocketManagerService>(SocketManagerService);
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        virtualStateService = createStubInstance<VirtualPlayerStateService>(VirtualPlayerStateService);
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
                {
                    provide: VirtualPlayerStateService,
                    useValue: virtualStateService,
                },
            ],
        }).compile();
        service = module.get<DoorOpeningService>(DoorOpeningService);
        server = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as sinon.SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should open a closed door', () => {
        const doorPosition: Vec2 = { x: 0, y: 0 };
        const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.trapped));
        roomManagerService.getCurrentRoomPlayer.returns(mockRoomGame.players[0]);
        socketManagerService.getGatewayServer.returns(server);
        const result = service.toggleDoor(mockRoomGame, doorPosition);
        expect(mockRoomGame.game.map.mapArray[0][0]).toBe(TileTerrain.OpenDoor);
        expect(result).toBe(TileTerrain.OpenDoor);
        expect(server.to.calledWith(mockRoomGame.room.roomCode)).toBeTruthy();
    });

    it('should close an open door', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 };
        const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.untrapped));
        roomManagerService.getCurrentRoomPlayer.returns(MOCK_ROOM_GAMES.untrapped.players[0]);
        socketManagerService.getGatewayServer.returns(server);
        const result = service.toggleDoor(mockRoomGame, doorPosition);
        expect(mockRoomGame.game.map.mapArray[1][1]).toBe(TileTerrain.ClosedDoor);
        expect(result).toBe(TileTerrain.ClosedDoor);
        expect(server.to.calledWith(MOCK_ROOM_GAMES.untrapped.room.roomCode)).toBeTruthy();
    });

    it('should return undefined if the terrain is not a door', () => {
        const doorPosition: Vec2 = { x: 1, y: 0 };
        const result = service.toggleDoor(MOCK_ROOM_GAMES.trapped, doorPosition);
        expect(result).toBeNull();
    });

    it('should not close a door if another player is there', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 };
        const result = service.toggleDoor(MOCK_ROOM_GAMES.untrappedTwoPlayers, doorPosition);
        expect(result).toBeNull();
    });
});
