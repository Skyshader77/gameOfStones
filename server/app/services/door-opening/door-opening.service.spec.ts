import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Player } from '@common/interfaces/player';
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

    it('should successfully toggle a door when no player is present on the tile', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 }; // Closed door position
        const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.zagzig));
        const initialTerrain = mockRoomGame.game.map.mapArray[doorPosition.y][doorPosition.x];
        expect(initialTerrain).toBe(TileTerrain.ClosedDoor);

        const result = service.toggleDoor(mockRoomGame, doorPosition);

        expect(result).toBe(TileTerrain.OpenDoor);
        expect(mockRoomGame.game.map.mapArray[doorPosition.y][doorPosition.x]).toBe(TileTerrain.OpenDoor);
        expect(server).toHaveBeenCalledWith(mockRoomGame.room.roomCode, {
            updatedTileTerrain: TileTerrain.OpenDoor,
            doorPosition,
        });
        expect(mockRoomGame.players[0].playerInGame.remainingActions).toBe(MOCK_PLAYER_IN_GAME.remainingActions - 1);
    });

    it('should not toggle a door when another player is present on the tile', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 }; // Closed door position
        const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.zagzig));
        mockRoomGame.players.push(mockRoomGame.createPlayer('2', 'Player2', doorPosition));

        const result = service.toggleDoor(mockRoomGame, doorPosition);

        expect(result).toBeNull();
        expect(mockRoomGame.game.map.mapArray[doorPosition.y][doorPosition.x]).toBe(TileTerrain.ClosedDoor);
        expect(server).not.toHaveBeenCalled();
    });

    it('should handle AI behavior when a virtual player toggles a door', () => {
        const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.zagzig));

        spyOn(virtualStateService, 'handleDoor').and.callThrough();

        const doorPosition: Vec2 = { x: 1, y: 1 }; // Closed door position
        const result = service.toggleDoor(mockRoomGame, doorPosition);

        expect(result).toBe(TileTerrain.OpenDoor);
        expect(virtualStateService.handleDoor).toHaveBeenCalledWith(mockRoomGame, TileTerrain.OpenDoor);
    });

    it('should call handleDoor when the player is not human and toggles a door', () => {
        const doorPosition: Vec2 = { x: 0, y: 0 };
        const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.zagzig));
        roomManagerService.getCurrentRoomPlayer.returns(MOCK_ROOM_GAMES.zagzig.players[0]);
        socketManagerService.getGatewayServer.returns(server);

        const result = service.toggleDoor(mockRoomGame, doorPosition);

        expect(result).toBe(TileTerrain.OpenDoor);
        expect(virtualStateService.handleDoor.calledOnceWith(mockRoomGame, TileTerrain.OpenDoor)).toBeTruthy();
    });

    it('should call handleDoor if the player is not human', () => {
        // Arrange
        const mockRoom: RoomGame = {
            // Mocked room properties
        } as unknown as RoomGame;
        const mockDoorPosition: Vec2 = { x: 0, y: 0 };
        const mockPlayer = { PlayerRole: PlayerRole.AggressiveAI, playerInGame: { remainingActions: 3 } } as unknown as Player;

        const socketManagerServiceSpy = jasmine.createSpyObj('SocketManagerService', ['getGatewayServer']);

        // Ajoutez un type pour le retour si nécessaire
        socketManagerServiceSpy.getGatewayServer.and.returnValue({
            to: jasmine.createSpy('to'),
        });

        socketManagerServiceSpy.getCurrentRoomPlayer.and.returnValue(mockPlayer);

        (window as any).isPlayerHuman = jasmine.createSpy('isPlayerHuman').and.returnValue(false);
        (window as any).isAnotherPlayerPresentOnTile = jasmine.createSpy('isAnotherPlayerPresentOnTile').and.returnValue(false);

        const doorOpeningServiceSpy = jasmine.createSpyObj('DoorOpeningService', ['modifyDoor']);
        doorOpeningServiceSpy.modifyDoor.and.returnValue(TileTerrain.OpenDoor);

        // Act
        const result = service.toggleDoor(mockRoom, mockDoorPosition);

        // Assert
        expect(virtualStateService.handleDoor).toHaveBeenCalledWith(mockRoom, TileTerrain.OpenDoor);
        expect(mockPlayer.playerInGame.remainingActions).toBe(2);
        expect(result).toBe(TileTerrain.OpenDoor);
    });
});
