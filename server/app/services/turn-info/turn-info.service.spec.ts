/* eslint-disable @typescript-eslint/no-explicit-any */

import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

import { ActionService } from '@app/services/action/action.service';
import { ConditionalItemService } from '@app/services/item/conditional-item/conditional-item.service';
import { SimpleItemService } from '@app/services/item/simple-item/simple-item.service';
import { SpecialItemService } from '@app/services/item/special-item/special-item.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { TurnInfoService } from './turn-info.service';

import { ICE_COMBAT_DEBUFF_VALUE } from '@app/constants/gameplay.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';

import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { MOCK_TURN_INFORMATION } from '@app/constants/turn.info.tests.constants';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Socket } from 'socket.io';

describe('TurnInfoService', () => {
    let service: TurnInfoService;
    let actionService: SinonStubbedInstance<ActionService>;
    let specialItemService: SinonStubbedInstance<SpecialItemService>;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let playerMovementService: SinonStubbedInstance<PlayerMovementService>;
    let simpleItemService: SinonStubbedInstance<SimpleItemService>;
    let conditionalItemService: SinonStubbedInstance<ConditionalItemService>;
    let mockSocket: SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        mockSocket = createStubInstance<Socket>(Socket);
        actionService = createStubInstance(ActionService);
        specialItemService = createStubInstance(SpecialItemService);
        socketManagerService = createStubInstance(SocketManagerService);
        roomManagerService = createStubInstance(RoomManagerService);
        playerMovementService = createStubInstance(PlayerMovementService);
        simpleItemService = createStubInstance(SimpleItemService);
        conditionalItemService = createStubInstance(ConditionalItemService);
        jest.spyOn(mockSocket, 'emit');
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TurnInfoService,
                { provide: SocketManagerService, useValue: socketManagerService },
                { provide: SpecialItemService, useValue: specialItemService },
                { provide: PlayerMovementService, useValue: playerMovementService },
                { provide: RoomManagerService, useValue: roomManagerService },
                { provide: SimpleItemService, useValue: simpleItemService },
                { provide: ConditionalItemService, useValue: conditionalItemService },
                { provide: ActionService, useValue: actionService },
            ],
        }).compile();

        service = module.get<TurnInfoService>(TurnInfoService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendTurnInformation', () => {
        it('should send turn information to the current player socket', () => {
            const mockRoomGame = MOCK_ROOM_GAMES.untrapped;
            const mockCurrentPlayer = mockRoomGame.players[0];

            socketManagerService.getPlayerSocket.returns(mockSocket);
            const getCurrentRoomPlayerSpy = jest.spyOn(roomManagerService, 'getCurrentRoomPlayer').mockReturnValue(mockCurrentPlayer);
            const getReachableTilesSpy = jest.spyOn(playerMovementService, 'getReachableTiles').mockReturnValue(MOCK_TURN_INFORMATION.reachableTiles);
            const getOverWorldActionsSpy = jest.spyOn(actionService, 'getOverWorldActions').mockReturnValue(MOCK_TURN_INFORMATION.actions);
            const getItemActionsSpy = jest.spyOn(service as any, 'getItemActions').mockReturnValue(MOCK_TURN_INFORMATION.itemActions);

            service.sendTurnInformation(mockRoomGame);

            expect(getCurrentRoomPlayerSpy).toHaveBeenCalledWith(mockRoomGame.room.roomCode);
            expect(mockSocket.emit).toHaveBeenCalledWith(
                GameEvents.TurnInfo,
                expect.objectContaining({
                    attributes: expect.any(Object),
                    reachableTiles: expect.any(Array),
                    actions: expect.any(Array),
                    itemActions: expect.any(Array),
                }),
            );

            getCurrentRoomPlayerSpy.mockRestore();
            getReachableTilesSpy.mockRestore();
            getOverWorldActionsSpy.mockRestore();
            getItemActionsSpy.mockRestore();
        });

        it('should not send turn information if player has abandoned', () => {
            const mockRoomGame = { ...MOCK_ROOM_GAMES.untrapped };
            mockRoomGame.players[0].playerInGame.hasAbandoned = true;

            socketManagerService.getPlayerSocket.returns(mockSocket);
            const getCurrentRoomPlayerSpy = jest.spyOn(roomManagerService, 'getCurrentRoomPlayer').mockReturnValue(mockRoomGame.players[0]);

            service.sendTurnInformation(mockRoomGame);

            expect(mockSocket.emit).not.toHaveBeenCalled();

            getCurrentRoomPlayerSpy.mockRestore();
        });
    });

    describe('updateCurrentPlayerAttributes', () => {
        it('should apply simple items and quartz skates to player attributes', () => {
            const mockRoomGame = MOCK_ROOM_GAMES.untrapped;
            const currentPlayer = mockRoomGame.players[0];

            const simpleItemSpy = jest.spyOn(simpleItemService, 'applySimpleItems');
            const conditionalItemSpy = jest.spyOn(conditionalItemService, 'applyQuartzSkates');

            service.updateCurrentPlayerAttributes(currentPlayer, mockRoomGame.game.map);

            expect(simpleItemSpy).toHaveBeenCalledWith(currentPlayer);
            expect(conditionalItemSpy).toHaveBeenCalledWith(currentPlayer, mockRoomGame.game.map);

            simpleItemSpy.mockRestore();
            conditionalItemSpy.mockRestore();
        });

        it('should apply ice debuff when player is on ice terrain', () => {
            const mockRoomGame = MOCK_ROOM_GAMES.untrapped;
            const currentPlayer = mockRoomGame.players[0];
            const initialAttack = currentPlayer.playerInGame.baseAttributes.attack;
            const initialDefense = currentPlayer.playerInGame.baseAttributes.defense;

            service.updateCurrentPlayerAttributes(currentPlayer, mockRoomGame.game.map);

            expect(currentPlayer.playerInGame.attributes.attack).toBe(initialAttack + ICE_COMBAT_DEBUFF_VALUE.attack);
            expect(currentPlayer.playerInGame.attributes.defense).toBe(initialDefense + ICE_COMBAT_DEBUFF_VALUE.defense);
        });
    });

    describe('getItemActions', () => {
        it('should return bomb action for GeodeBomb', () => {
            const mockRoomGame = MOCK_ROOM_GAMES.untrapped;
            const currentPlayer = { ...mockRoomGame.players[0] };
            currentPlayer.playerInGame.inventory = [ItemType.GeodeBomb];

            specialItemService.determineBombAffectedTiles.returns({
                overWorldAction: {
                    action: OverWorldActionType.Bomb,
                    position: { x: 0, y: 0 },
                },
                affectedTiles: [],
            });

            const itemActions = service['getItemActions'](currentPlayer, mockRoomGame);

            expect(itemActions).toHaveLength(1);
            expect(itemActions[0].overWorldAction.action).toBe(OverWorldActionType.Bomb);
        });

        it('should return hammer action for GraniteHammer', () => {
            const mockRoomGame = MOCK_ROOM_GAMES.untrapped;
            const currentPlayer = { ...mockRoomGame.players[0] };
            currentPlayer.playerInGame.inventory = [ItemType.GraniteHammer];

            specialItemService.handleHammerActionTiles.returns([
                {
                    overWorldAction: {
                        action: OverWorldActionType.Hammer,
                        position: { x: 0, y: 0 },
                    },
                    affectedTiles: [],
                },
            ]);

            const itemActions = service['getItemActions'](currentPlayer, mockRoomGame);

            expect(itemActions).toHaveLength(1);
            expect(itemActions[0].overWorldAction.action).toBe(OverWorldActionType.Hammer);
        });
    });
});
