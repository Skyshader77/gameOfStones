import { MOCK_MOVEMENT, MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { AiPlayerActionInput } from '@app/constants/virtual-player.constants';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { FightManagerService } from '@app/services/fight/fight/fight-manager.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { VirtualPlayerBehaviorService } from './virtual-player-behavior.service';
describe('VirtualPlayerBehaviorService', () => {
    let service: VirtualPlayerBehaviorService;
    let playerMovementService: sinon.SinonStubbedInstance<PlayerMovementService>;
    let roomManagerService: sinon.SinonStubbedInstance<RoomManagerService>;
    let socketManagerService: sinon.SinonStubbedInstance<SocketManagerService>;
    let itemManagerService: sinon.SinonStubbedInstance<ItemManagerService>;
    let doorManagerService: sinon.SinonStubbedInstance<DoorOpeningService>;
    let fightManagerService: sinon.SinonStubbedInstance<FightManagerService>;
    let mockServer: SinonStubbedInstance<Server>;
    beforeEach(async () => {
        doorManagerService = createStubInstance<DoorOpeningService>(DoorOpeningService);
        itemManagerService = createStubInstance<ItemManagerService>(ItemManagerService);
        fightManagerService = createStubInstance<FightManagerService>(FightManagerService);
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        playerMovementService = createStubInstance<PlayerMovementService>(PlayerMovementService);
        socketManagerService = createStubInstance<SocketManagerService>(SocketManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VirtualPlayerBehaviorService,
                { provide: PlayerMovementService, useValue: playerMovementService },
                { provide: RoomManagerService, useValue: roomManagerService },
                { provide: SocketManagerService, useValue: socketManagerService },
                { provide: ItemManagerService, useValue: itemManagerService },
                { provide: DoorOpeningService, useValue: doorManagerService },
                { provide: FightManagerService, useValue: fightManagerService },
            ],
        }).compile();
        service = module.get<VirtualPlayerBehaviorService>(VirtualPlayerBehaviorService);
        mockServer = {
            to: sinon.stub().returnsThis(),
            emit: sinon.stub(),
        } as SinonStubbedInstance<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>>;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('isFightAvailable', () => {
        it('should return true when opponent is adjacent horizontally', () => {
            const result = service['isFightAvailable']({ x: 1, y: 0 }, { x: 0, y: 0 });
            expect(result).toBeTruthy();
        });

        it('should return true when opponent is adjacent vertically', () => {
            const result = service['isFightAvailable']({ x: 0, y: 1 }, { x: 0, y: 0 });
            expect(result).toBeTruthy();
        });

        it('should return false when opponent is diagonal', () => {
            const result = service['isFightAvailable']({ x: 1, y: 1 }, { x: 0, y: 0 });
            expect(result).toBeFalsy();
        });

        it('should return false when opponent is too far', () => {
            const result = service['isFightAvailable']({ x: 2, y: 0 }, { x: 0, y: 0 });
            expect(result).toBeFalsy();
        });
    });

    describe('getDoorPosition', () => {
        it('should find adjacent closed door', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.trapped));
            const currentPosition: Vec2 = { x: 1, y: 0 };
            const result = service['getDoorPosition'](currentPosition, mockRoom);
            expect(result).toEqual({ x: 0, y: 0 });
        });

        it('should return null when no adjacent door', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor));
            const currentPosition: Vec2 = { x: 0, y: 0 };
            const result = service['getDoorPosition'](currentPosition, mockRoom);
            expect(result).toBeNull();
        });

        it('should handle edge of map positions', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.trapped));
            const currentPosition: Vec2 = { x: 2, y: 2 };
            const result = service['getDoorPosition'](currentPosition, mockRoom);
            expect(result).toEqual({ x: 2, y: 1 });
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

    describe('isPlayerCloserThanItem', () => {
        it('should return true when no item position exists', () => {
            const result = service['isPlayerCloserThanItem']({ position: { x: 1, y: 1 }, cost: 2 }, { position: null, cost: 0 }, true);
            expect(result).toBeTruthy();
        });

        it('should return true when player is closer than item', () => {
            const result = service['isPlayerCloserThanItem']({ position: { x: 1, y: 1 }, cost: 1 }, { position: { x: 2, y: 2 }, cost: 2 }, true);
            expect(result).toBeTruthy();
        });

        it('should return false when item is closer than player', () => {
            const result = service['isPlayerCloserThanItem']({ position: { x: 1, y: 1 }, cost: 3 }, { position: { x: 2, y: 2 }, cost: 1 }, true);
            expect(result).toBeFalsy();
        });

        it('should use offensive AI preference when distances are equal', () => {
            const result = service['isPlayerCloserThanItem']({ position: { x: 1, y: 1 }, cost: 2 }, { position: { x: 2, y: 2 }, cost: 2 }, true);
            expect(result).toBeTruthy();
        });

        it('should use defensive AI preference when distances are equal', () => {
            const result = service['isPlayerCloserThanItem']({ position: { x: 1, y: 1 }, cost: 2 }, { position: { x: 2, y: 2 }, cost: 2 }, false);
            expect(result).toBeFalsy();
        });
    });

    describe('toggleDoorAI', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.trapped));
        const mockVirtualPlayer = JSON.parse(JSON.stringify(mockRoom.players[0]));

        it('should toggle door when adjacent to one', () => {
            const mockNewDoorState = TileTerrain.OpenDoor;
            doorManagerService.toggleDoor.returns(mockNewDoorState);
            socketManagerService.getGatewayServer.returns(mockServer);

            service['toggleDoorAi'](mockRoom, mockVirtualPlayer);

            expect(doorManagerService.toggleDoor).toBeCalled;
            expect(mockServer.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
            expect(mockVirtualPlayer.playerInGame.remainingActions).toBe(0);
        });

        it('should not toggle door when not adjacent to one', () => {
            mockVirtualPlayer.playerInGame.currentPosition = { x: 0, y: 0 };
            socketManagerService.getGatewayServer.returns(mockServer);
            service['toggleDoorAi'](mockRoom, mockVirtualPlayer);

            expect(doorManagerService.toggleDoor).not.toBeCalled;
            expect(socketManagerService.getGatewayServer).not.toBeCalled;
        });
    });

    describe('canFight', () => {
        const mockVirtualPlayer = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers.players[0]));
        const mockAIInput: AiPlayerActionInput = {
            closestPlayer: {
                position: { x: 1, y: 0 },
                cost: 0,
            },
            closestItem: { position: { x: 2, y: 2 }, cost: 3 },
        };

        it('should return true when player has actions and is next to opponent', () => {
            mockVirtualPlayer.playerInGame.remainingActions = 1;
            expect(service['canFight'](mockVirtualPlayer, mockAIInput)).toBeTruthy();
        });

        it('should return false when player has no actions', () => {
            mockVirtualPlayer.playerInGame.remainingActions = 0;
            expect(service['canFight'](mockVirtualPlayer, mockAIInput)).toBeFalsy();
        });

        it('should return false when opponent is not in fighting range', () => {
            mockVirtualPlayer.playerInGame.remainingActions = 1;
            const farInput: AiPlayerActionInput = {
                ...mockAIInput,
                closestPlayer: { position: { x: 2, y: 2 }, cost: 5 },
            };
            expect(service['canFight'](mockVirtualPlayer, farInput)).toBeFalsy();
        });
    });

    describe('moveAI', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));
        const mockNewPosition: Vec2 = { x: 1, y: 1 };

        it('should handle normal movement without slipping', () => {
            playerMovementService.executePlayerMovement.returns(MOCK_MOVEMENT.moveResults.normal);
            roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
            socketManagerService.getGatewayServer.returns(mockServer);

            service['moveAi'](mockNewPosition, mockRoom, true);

            expect(playerMovementService.executePlayerMovement).toBeCalled;
            expect(socketManagerService.getGatewayServer).toBeCalled;
            expect(mockServer.to.calledWith(mockRoom.room.roomCode)).toBeTruthy();
            expect(mockServer.emit.calledWith(GameEvents.PlayerMove, MOCK_MOVEMENT.moveResults.normal)).toBeTruthy();
        });

        it('should handle movement with slipping', () => {
            playerMovementService.executePlayerMovement.returns(MOCK_MOVEMENT.moveResults.tripped);
            roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
            socketManagerService.getGatewayServer.returns(mockServer);

            service['moveAi'](mockNewPosition, mockRoom, true);

            expect(mockServer.emit.calledWith(GameEvents.PlayerSlipped, mockRoom.players[0].playerInfo.userName)).toBeTruthy();
        });

        it('should handle item pickup during movement', () => {
            playerMovementService.executePlayerMovement.returns(MOCK_MOVEMENT.moveResults.itemNoTrip);
            roomManagerService.getCurrentRoomPlayer.returns(mockRoom.players[0]);
            socketManagerService.getGatewayServer.returns(mockServer);

            service['moveAi'](mockNewPosition, mockRoom, true);

            expect(itemManagerService.handleItemPickup).toBeCalled;
        });
    });
});
