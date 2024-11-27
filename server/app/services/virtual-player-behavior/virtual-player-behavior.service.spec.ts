import { MOCK_MOVEMENT, MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { MOCK_AGGRESSIVE_VIRTUAL_PLAYER, MOCK_CLOSEST_OBJECT_DATA, MOCK_VIRTUAL_PLAYER_STATE } from '@app/constants/virtual-player-test.constants';
import { ClosestObjectData, VirtualPlayerState } from '@app/interfaces/ai-state';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { FightManagerService } from '@app/services/fight/fight/fight-manager.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { VirtualPlayerBehaviorService } from './virtual-player-behavior.service';
import { PathfindingService } from '@app/services/dijkstra/dijkstra.service';
describe('VirtualPlayerBehaviorService', () => {
    let service: VirtualPlayerBehaviorService;
    let playerMovementService: sinon.SinonStubbedInstance<PlayerMovementService>;
    let roomManagerService: sinon.SinonStubbedInstance<RoomManagerService>;
    let socketManagerService: sinon.SinonStubbedInstance<SocketManagerService>;
    let itemManagerService: sinon.SinonStubbedInstance<ItemManagerService>;
    let doorManagerService: sinon.SinonStubbedInstance<DoorOpeningService>;
    let fightManagerService: sinon.SinonStubbedInstance<FightManagerService>;
    let mockServer: SinonStubbedInstance<Server>;
    let mockAggressiveVirtualPlayer: Player;
    let mockClosestObjectData: ClosestObjectData;
    let pathfindingService: sinon.SinonStubbedInstance<PathfindingService>;
    let mockState: VirtualPlayerState;
    beforeEach(async () => {
        doorManagerService = createStubInstance<DoorOpeningService>(DoorOpeningService);
        itemManagerService = createStubInstance<ItemManagerService>(ItemManagerService);
        fightManagerService = createStubInstance<FightManagerService>(FightManagerService);
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        playerMovementService = createStubInstance<PlayerMovementService>(PlayerMovementService);
        socketManagerService = createStubInstance<SocketManagerService>(SocketManagerService);
        pathfindingService = createStubInstance<PathfindingService>(PathfindingService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VirtualPlayerBehaviorService,
                { provide: PlayerMovementService, useValue: playerMovementService },
                { provide: RoomManagerService, useValue: roomManagerService },
                { provide: SocketManagerService, useValue: socketManagerService },
                { provide: ItemManagerService, useValue: itemManagerService },
                { provide: DoorOpeningService, useValue: doorManagerService },
                { provide: FightManagerService, useValue: fightManagerService },
                { provide: PathfindingService, useValue: pathfindingService },
            ],
        }).compile();
        service = module.get<VirtualPlayerBehaviorService>(VirtualPlayerBehaviorService);
        mockServer = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
        mockAggressiveVirtualPlayer = JSON.parse(JSON.stringify(MOCK_AGGRESSIVE_VIRTUAL_PLAYER));
        mockClosestObjectData = MOCK_CLOSEST_OBJECT_DATA;
        // mockTurnData = JSON.parse(JSON.stringify(MOCK_TURN_DATA));
        mockState = MOCK_VIRTUAL_PLAYER_STATE;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('isFightAvailable', () => {
        it('should return true when opponent is adjacent horizontally', () => {
            const result = service['isNextToOtherPlayer']({ x: 1, y: 0 }, { x: 0, y: 0 });
            expect(result).toBeTruthy();
        });

        it('should return true when opponent is adjacent vertically', () => {
            const result = service['isNextToOtherPlayer']({ x: 0, y: 1 }, { x: 0, y: 0 });
            expect(result).toBeTruthy();
        });

        it('should return false when opponent is diagonal', () => {
            const result = service['isNextToOtherPlayer']({ x: 1, y: 1 }, { x: 0, y: 0 });
            expect(result).toBeFalsy();
        });

        it('should return false when opponent is too far', () => {
            const result = service['isNextToOtherPlayer']({ x: 2, y: 0 }, { x: 0, y: 0 });
            expect(result).toBeFalsy();
        });
    });

    describe('findPlayerAtPosition', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        it('should find player at given position', () => {
            const position: Vec2 = { x: 0, y: 0 };
            const result = service['findPlayerAtPosition'](position, mockRoom);
            expect(result).toBe('Player1');
        });

        it('should return null when no player at position', () => {
            const position: Vec2 = { x: 9, y: 9 };
            const result = service['findPlayerAtPosition'](position, mockRoom);
            expect(result).toBeNull();
        });
    });

    describe('canFight', () => {
        it('should return true when player has actions and is next to opponent', () => {
            mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
            expect(service['canFight'](mockAggressiveVirtualPlayer, mockClosestObjectData.closestPlayer.position)).toBeTruthy();
        });

        it('should return false when player has no actions', () => {
            mockAggressiveVirtualPlayer.playerInGame.remainingActions = 0;
            expect(service['canFight'](mockAggressiveVirtualPlayer, mockClosestObjectData.closestPlayer.position)).toBeFalsy();
        });

        it('should return false when opponent is not in fighting range', () => {
            mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
            const farPlayerObjectData: ClosestObjectData = {
                ...mockClosestObjectData,
                closestPlayer: { position: { x: 2, y: 2 }, cost: 5 },
            };
            expect(service['canFight'](mockAggressiveVirtualPlayer, farPlayerObjectData.closestPlayer.position)).toBeFalsy();
        });
    });

    describe('moveAI', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));
        const mockNewPosition: Vec2 = { x: 1, y: 1 };

        it('should handle normal movement without slipping', () => {
            const playerMovementSpy = jest.spyOn(playerMovementService, 'executePlayerMovement').mockReturnValue(MOCK_MOVEMENT.moveResults.normal);
            const getGatewayServerSpy = jest.spyOn(socketManagerService, 'getGatewayServer').mockReturnValue(mockServer);
            roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
            jest.spyOn(service, 'getRoomVirtualPlayerState').mockReturnValue(mockState);

            service['moveAI'](mockNewPosition, mockRoom, true);

            expect(playerMovementSpy).toBeCalled();
            expect(getGatewayServerSpy).toBeCalled();
            expect(mockServer.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
            expect(mockServer.emit.calledWith(GameEvents.PlayerMove, MOCK_MOVEMENT.moveResults.normal)).toBeTruthy();
        });

        it('should handle movement with slipping', () => {
            playerMovementService.executePlayerMovement.returns(MOCK_MOVEMENT.moveResults.tripped);
            roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
            socketManagerService.getGatewayServer.returns(mockServer);
            jest.spyOn(service, 'getRoomVirtualPlayerState').mockReturnValue(mockState);

            service['moveAI'](mockNewPosition, mockRoom, true);

            expect(mockServer.emit.calledWith(GameEvents.PlayerSlipped, mockRoom.players[0].playerInfo.userName)).toBeTruthy();
        });

        it('should handle item pickup during movement', () => {
            playerMovementService.executePlayerMovement.returns(MOCK_MOVEMENT.moveResults.itemNoTrip);
            roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
            socketManagerService.getGatewayServer.returns(mockServer);
            jest.spyOn(service, 'getRoomVirtualPlayerState').mockReturnValue(mockState);
            const itemPickupSpy = jest.spyOn(itemManagerService, 'handleItemPickup');

            service['moveAI'](mockNewPosition, mockRoom, true);

            expect(itemPickupSpy).toBeCalled();
        });
    });
});
