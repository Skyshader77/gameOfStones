/* eslint-disable*/
import { ItemManagerService } from './item-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { SpecialItemService } from '@app/services/item/special-item/special-item.service';
import { ItemType, DEFENSIVE_ITEMS, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { MAX_INVENTORY_SIZE } from '@common/constants/player.constants';
import { Socket, Server } from 'socket.io';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { Player } from '@common/interfaces/player';
import { PlayerRole } from '@common/enums/player-role.enum';
import { BOMB_ANIMATION_DELAY_MS } from '@app/constants/item.constants';
import { Map } from '@common/interfaces/map';
import { RoomGame } from '@app/interfaces/room-game';
import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';

describe('ItemManagerService', () => {
    let service: ItemManagerService;
    let roomManagerService: jest.Mocked<RoomManagerService>;
    let socketManagerService: jest.Mocked<SocketManagerService>;
    let messagingGateway: jest.Mocked<MessagingGateway>;
    let gameStatsService: jest.Mocked<GameStatsService>;
    let pathFindingService: jest.Mocked<PathFindingService>;
    let specialItemService: jest.Mocked<SpecialItemService>;
    let mockServer: jest.Mocked<Server>;
    let mockSocket: jest.Mocked<Socket>;

    const mockPlayer: Player = {
        playerInfo: {
            id: '1',
            userName: 'test',
            role: PlayerRole.Human,
            avatar: 1,
        },
        playerInGame: {
            inventory: [ItemType.GraniteHammer],
            currentPosition: { x: 0, y: 0 },
            startPosition: { x: 0, y: 0 },
            baseAttributes: { hp: 100, speed: 1, attack: 1, defense: 1 },
            attributes: { hp: 100, speed: 1, attack: 1, defense: 1 },
            remainingMovement: 0,
            remainingActions: 0,
            remainingHp: 100,
            winCount: 0,
            hasAbandoned: false,
            dice: undefined,
        },
    };

    const mockAIPlayer: Player = {
        playerInfo: {
            id: '2',
            userName: 'ai',
            role: PlayerRole.AggressiveAI,
            avatar: 1,
        },
        playerInGame: {
            ...mockPlayer.playerInGame,
            currentPosition: { x: 1, y: 1 },
            startPosition: { x: 1, y: 1 },
        },
    };

    const createMockRoom = (placedItems: any[] = []): RoomGame => ({
        ...MOCK_ROOM_GAMES.corridor,
        game: {
            ...MOCK_ROOM_GAMES.corridor.game,
            map: {
                ...MOCK_ROOM_GAMES.corridor.game.map,
                placedItems,
            },
            removedSpecialItems: [],
        },
    });

    beforeEach(() => {
        jest.useFakeTimers();

        mockServer = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        } as any;

        mockSocket = {
            emit: jest.fn(),
        } as any;

        roomManagerService = {
            getCurrentRoomPlayer: jest.fn().mockReturnValue(mockPlayer),
            getPlayerInRoom: jest.fn().mockReturnValue(mockPlayer),
        } as any;

        socketManagerService = {
            getGatewayServer: jest.fn().mockReturnValue(mockServer),
            getPlayerSocket: jest.fn().mockReturnValue(mockSocket),
        } as any;

        messagingGateway = {
            sendItemPickupJournal: jest.fn(),
        } as any;

        gameStatsService = {
            processItemPickupStats: jest.fn(),
        } as any;

        pathFindingService = {
            findNearestValidPosition: jest.fn().mockReturnValue({ x: 1, y: 1 }),
            getReSpawnPosition: jest.fn().mockReturnValue({ x: 2, y: 2 }),
        } as any;

        specialItemService = {
            handleBombUsed: jest.fn().mockReturnValue([mockPlayer]),
            determineHammerAffectedTiles: jest.fn().mockReturnValue({
                affectedTiles: [{ x: 0, y: 0 }],
                overWorldAction: { action: 2, position: { x: 0, y: 0 } },
            }),
            handleHammerUsed: jest.fn().mockReturnValue([mockPlayer]),
        } as any;

        service = new ItemManagerService();
        (service as any).roomManagerService = roomManagerService;
        (service as any).socketManagerService = socketManagerService;
        (service as any).messagingGateway = messagingGateway;
        (service as any).gameStatsService = gameStatsService;
        (service as any).pathFindingService = pathFindingService;
        (service as any).specialItemService = specialItemService;
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe('hasToDropItem', () => {
        it('should return true when inventory is over max size', () => {
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = new Array(MAX_INVENTORY_SIZE + 1).fill(ItemType.Flag);
            expect(service.hasToDropItem(testPlayer)).toBe(true);
        });

        it('should return false when inventory is at max size', () => {
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = new Array(MAX_INVENTORY_SIZE).fill(ItemType.Flag);
            expect(service.hasToDropItem(testPlayer)).toBe(false);
        });
    });

    describe('handleGameStartItems', () => {
        it('should place random items and remove starts', () => {
            const mockRoom = createMockRoom([
                { type: ItemType.Random, position: { x: 0, y: 0 } },
                { type: ItemType.Start, position: { x: 1, y: 1 } },
            ]);

            service.handleGameStartItems(mockRoom);

            expect(mockRoom.game.map.placedItems).toHaveLength(1);
            expect(mockRoom.game.map.placedItems[0].type).not.toBe(ItemType.Random);
            expect(mockRoom.game.map.placedItems[0].type).not.toBe(ItemType.Start);
        });

        it('should only remove starts when no random items', () => {
            const mockRoom = createMockRoom([
                { type: ItemType.Start, position: { x: 0, y: 0 } },
                { type: ItemType.Flag, position: { x: 1, y: 1 } },
            ]);

            service.handleGameStartItems(mockRoom);

            expect(mockRoom.game.map.placedItems).toHaveLength(1);
            expect(mockRoom.game.map.placedItems[0].type).toBe(ItemType.Flag);
        });
    });

    describe('determineSpecialItemRespawnPosition', () => {
        it('should find valid position for respawn', () => {
            const expectedPosition: Vec2 = { x: 1, y: 1 };
            pathFindingService.findNearestValidPosition.mockReturnValue(expectedPosition);

            const result = service.determineSpecialItemRespawnPosition(MOCK_ROOM_GAMES.corridor);

            expect(result).toEqual(expectedPosition);
            expect(pathFindingService.findNearestValidPosition).toHaveBeenCalled();
        });
    });

    describe('addRemovedSpecialItems', () => {
        it('should respawn all removed special items', () => {
            const mockRoom = createMockRoom([]);
            mockRoom.game.removedSpecialItems = [ItemType.GeodeBomb, ItemType.GraniteHammer];

            service.addRemovedSpecialItems(mockRoom);

            expect(mockServer.emit).toHaveBeenCalledTimes(2);
            expect(mockRoom.game.removedSpecialItems).toHaveLength(0);
            expect(mockRoom.game.map.placedItems).toHaveLength(2);
        });
    });

    describe('placeRandomItems', () => {
        it('should replace all random items with valid items', () => {
            const mockRoom = createMockRoom([
                { type: ItemType.Random, position: { x: 0, y: 0 } },
                { type: ItemType.Random, position: { x: 1, y: 1 } },
                { type: ItemType.Flag, position: { x: 2, y: 2 } },
            ]);

            service.placeRandomItems(mockRoom);

            expect(mockRoom.game.map.placedItems).toHaveLength(3);
            mockRoom.game.map.placedItems.forEach((item) => {
                expect(item.type).not.toBe(ItemType.Random);
                expect(item.type).not.toBe(ItemType.Start);
            });
        });
    });

    describe('handlePlayerDeath', () => {
        it('should handle death and return correct payload', () => {
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.SapphireFins, ItemType.GeodeBomb];

            const result = service.handlePlayerDeath(createMockRoom(), testPlayer, ItemType.GeodeBomb);

            expect(result.player).toBe(testPlayer);
            expect(result.respawnPosition).toEqual(expect.any(Object));
            expect(testPlayer.playerInGame.inventory).toHaveLength(0);
        });
    });

    describe('handleItemUsed', () => {
        it('should handle bomb usage with animation delay', () => {
            const mockRoom = createMockRoom();

            service.handleItemUsed(mockRoom, 'test', {
                type: ItemType.GeodeBomb,
                usagePosition: { x: 0, y: 0 },
            });

            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.BombUsed);
            jest.advanceTimersByTime(BOMB_ANIMATION_DELAY_MS);
            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.PlayerDead, expect.any(Array));
            expect(mockRoom.game.hasPendingAction).toBe(true);
        });

        it('should handle hammer usage', () => {
            const mockRoom = createMockRoom();
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.GraniteHammer];
            roomManagerService.getPlayerInRoom.mockReturnValue(testPlayer);

            service.handleItemUsed(mockRoom, 'test', {
                type: ItemType.GraniteHammer,
                usagePosition: { x: 0, y: 0 },
            });

            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.HammerUsed, expect.any(Object));
            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.PlayerDead, expect.any(Array));
            expect(mockRoom.game.hasPendingAction).toBe(true);
        });
    });

    describe('handleItemLost', () => {
        it('should handle special item loss', () => {
            const mockRoom = createMockRoom();
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.GeodeBomb];
            roomManagerService.getPlayerInRoom.mockReturnValue(testPlayer);

            service.handleItemLost(mockRoom, 'test', {
                itemType: ItemType.GeodeBomb,
                itemDropPosition: { x: 0, y: 0 },
                isUsedSpecialItem: true,
            });

            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.ItemLost, expect.any(Object));
            expect(mockRoom.game.removedSpecialItems).toContain(ItemType.GeodeBomb);
        });

        it('should return undefined if no valid position found for normal item loss', () => {
            const mockRoom = createMockRoom();
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.Flag];
            roomManagerService.getPlayerInRoom.mockReturnValue(testPlayer);
            const itemDropPosition = { x: 0, y: 0 };
            pathFindingService.findNearestValidPosition.mockReturnValue(null);
      
            const result = (service as any).loseItem(mockRoom, testPlayer, {
              itemType: ItemType.Flag,
              itemDropPosition,
              isUsedSpecialItem: false,
            });
      
            expect(result).toBeUndefined();
            expect(mockRoom.game.map.placedItems).toHaveLength(0);
            expect(testPlayer.playerInGame.inventory).toContain(ItemType.Flag);
          });

        it('should handle normal item loss', () => {
            const mockRoom = createMockRoom();
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.Flag];
            roomManagerService.getPlayerInRoom.mockReturnValue(testPlayer);

            service.handleItemLost(mockRoom, 'test', {
                itemType: ItemType.Flag,
                itemDropPosition: { x: 0, y: 0 },
                isUsedSpecialItem: false,
            });

            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.ItemDropped, expect.any(Object));
            expect(mockRoom.game.map.placedItems).toHaveLength(1);
        });
    });

    describe('handleItemDrop', () => {
        it('should handle dropping an item from inventory', () => {
            const mockRoom = createMockRoom();
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.Flag];
            roomManagerService.getPlayerInRoom.mockReturnValue(testPlayer);

            service.handleItemDrop(mockRoom, 'test', ItemType.Flag);

            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.ItemDropped, expect.any(Object));
            expect(testPlayer.playerInGame.inventory).toHaveLength(0);
            expect(mockRoom.game.map.placedItems).toHaveLength(1);
        });

        it('should not drop item if not in inventory', () => {
            const mockRoom = createMockRoom();
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [];
            roomManagerService.getPlayerInRoom.mockReturnValue(testPlayer);

            const result = service.handleItemDrop(mockRoom, 'test', ItemType.Flag);

            expect(result).toBeUndefined();
            expect(mockRoom.game.map.placedItems).toHaveLength(0);
        });
    });

    describe('handleItemPickup', () => {
        it('should pickup available item', () => {
            const mockRoom = createMockRoom([{ type: ItemType.Flag, position: { x: 0, y: 0 } }]);
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [];
            testPlayer.playerInGame.currentPosition = { x: 0, y: 0 }; // Match item position

            service.handleItemPickup(mockRoom, testPlayer);

            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.ItemPickedUp, expect.any(Object));
            expect(testPlayer.playerInGame.inventory).toContain(ItemType.Flag);
            expect(mockRoom.game.map.placedItems).toHaveLength(0);
        });

        it('should handle full inventory for human player', () => {
            const mockRoom = createMockRoom([{ type: ItemType.Flag, position: { x: 0, y: 0 } }]);
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = new Array(MAX_INVENTORY_SIZE).fill(ItemType.BismuthShield);
            testPlayer.playerInGame.currentPosition = { x: 0, y: 0 }; // Match item position

            service.handleItemPickup(mockRoom, testPlayer);

            expect(mockSocket.emit).toHaveBeenCalledWith(GameEvents.InventoryFull);
            expect(mockRoom.game.hasPendingAction).toBe(true);
        });

        it('should handle full inventory for aggressive AI', () => {
            const mockRoom = createMockRoom([{ type: ItemType.GeodeBomb, position: { x: 1, y: 1 } }]);
            const testAIPlayer = { ...mockAIPlayer };
            testAIPlayer.playerInGame.inventory = new Array(MAX_INVENTORY_SIZE).fill(ItemType.SapphireFins);

            service.handleItemPickup(mockRoom, testAIPlayer);

            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.ItemDropped, expect.any(Object));
            expect(testAIPlayer.playerInGame.inventory).toContain(ItemType.GeodeBomb);
        });

        it('should not pickup start items', () => {
            const mockRoom = createMockRoom([{ type: ItemType.Start, position: { x: 0, y: 0 } }]);
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.currentPosition = { x: 0, y: 0 }; // Match item position

            service.handleItemPickup(mockRoom, testPlayer);

            expect(testPlayer.playerInGame.inventory).not.toContain(ItemType.Start);
            expect(mockRoom.game.map.placedItems).toHaveLength(1);
        });
    });

    describe('remainingDefensiveItemCount', () => {
        it('should count defensive items correctly', () => {
            const mockRoom = createMockRoom([
                { type: ItemType.SapphireFins, position: { x: 0, y: 0 } },
                { type: ItemType.GeodeBomb, position: { x: 1, y: 1 } },
            ]);

            const count = service.remainingDefensiveItemCount(mockRoom);
            expect(count).toBe(1);
        });
    });

    describe('handleRespawn', () => {
        it('should handle respawn with inventory loss', () => {
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.SapphireFins, ItemType.GeodeBomb];
            const mockRoom = createMockRoom();

            const result = service.handleRespawn(mockRoom, testPlayer, ItemType.GeodeBomb);

            expect(result.player).toBe(testPlayer);
            expect(result.respawnPosition).toEqual(expect.any(Object));
            expect(testPlayer.playerInGame.inventory).toHaveLength(0);
            expect(mockRoom.game.removedSpecialItems).toContain(ItemType.GeodeBomb);
        });
    });

    describe('handleInventoryLoss', () => {
        it('should handle loss of all items including special item', () => {
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.SapphireFins, ItemType.GeodeBomb];
            const mockRoom = createMockRoom();

            service.handleInventoryLoss(testPlayer, mockRoom, ItemType.GeodeBomb);

            expect(testPlayer.playerInGame.inventory).toHaveLength(0);
            expect(mockRoom.game.removedSpecialItems).toContain(ItemType.GeodeBomb);
            expect(mockRoom.game.map.placedItems).toHaveLength(1); // Shield should be placed
        });
    });

    describe('keepItemsInInventory', () => {
        it('should keep offensive items for aggressive AI', () => {
            const testPlayer = { ...mockAIPlayer };
            testPlayer.playerInGame.inventory = [ItemType.GeodeBomb];
            const mockRoom = createMockRoom();

            (service as any).keepItemsInInventory(mockRoom, testPlayer, OFFENSIVE_ITEMS);

            expect(testPlayer.playerInGame.inventory).toEqual([ItemType.GeodeBomb]);
        });

        it('should keep defensive items for defensive AI', () => {
            const testPlayer = { ...mockAIPlayer };
            testPlayer.playerInfo.role = PlayerRole.DefensiveAI;
            testPlayer.playerInGame.inventory = [ItemType.BismuthShield];
            const mockRoom = createMockRoom();

            (service as any).keepItemsInInventory(mockRoom, testPlayer, DEFENSIVE_ITEMS);

            expect(testPlayer.playerInGame.inventory).toEqual([ItemType.BismuthShield]);
        });

        it('should drop first item if no preferred items found', () => {
            const testPlayer = { ...mockAIPlayer };
            const mockRoom = createMockRoom();

            roomManagerService.getPlayerInRoom.mockReturnValue(testPlayer);
            testPlayer.playerInGame.inventory = [ItemType.Flag];

            (service as any).keepItemsInInventory(mockRoom, testPlayer, OFFENSIVE_ITEMS);

            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.ItemDropped, {
                playerName: testPlayer.playerInfo.userName,
                newInventory: [],
                item: {
                    type: ItemType.Flag,
                    position: { x: 1, y: 1 },
                },
            });
            expect(testPlayer.playerInGame.inventory).toEqual([]);
        });
    });

    describe('getListOfAvailableItems', () => {
        it('should exclude specific item types', () => {
            const placedItems = [ItemType.Flag];
            const result = (service as any).getListOfAvailableItems(placedItems);

            expect(result).not.toContain(ItemType.Random);
            expect(result).not.toContain(ItemType.Start);
            expect(result).not.toContain(ItemType.Flag);
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('getPlayerTileItem', () => {
        it('should return item at player position', () => {
            const expectedItem = { type: ItemType.Flag, position: { x: 0, y: 0 } };
            const mockRoom = createMockRoom([expectedItem]);
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.currentPosition = { x: 0, y: 0 }; // Match item position

            const result = (service as any).getPlayerTileItem(mockRoom, testPlayer);

            expect(result).toEqual(expectedItem);
        });

        it('should return null when no item at position', () => {
            const mockRoom = createMockRoom([{ type: ItemType.Flag, position: { x: 1, y: 1 } }]);

            const result = (service as any).getPlayerTileItem(mockRoom, mockPlayer);

            expect(result).toBeNull();
        });
    });

    describe('isInventoryFull', () => {
        it('should return true when inventory is full', () => {
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = new Array(MAX_INVENTORY_SIZE).fill(ItemType.Flag);

            const result = (service as any).isInventoryFull(testPlayer);

            expect(result).toBe(true);
        });

        it('should handle full inventory for defensive AI', () => {
            const mockRoom = createMockRoom([{ type: ItemType.BismuthShield, position: { x: 1, y: 1 } }]);
            const testAIPlayer = { ...mockAIPlayer };
            testAIPlayer.playerInfo.role = PlayerRole.DefensiveAI;
            testAIPlayer.playerInGame.inventory = new Array(MAX_INVENTORY_SIZE).fill(ItemType.GeodeBomb);

            service.handleItemPickup(mockRoom, testAIPlayer);

            expect(mockServer.emit).toHaveBeenCalledWith(GameEvents.ItemDropped, expect.any(Object));
            expect(testAIPlayer.playerInGame.inventory).toContain(ItemType.BismuthShield);
        });

        it('should return false when inventory is not full', () => {
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.Flag];

            const result = (service as any).isInventoryFull(testPlayer);

            expect(result).toBe(false);
        });
    });

    describe('pickUpItem', () => {
        it('should add item to inventory and update game state', () => {
            const mockRoom = createMockRoom([{ type: ItemType.Flag, position: { x: 0, y: 0 } }]);
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [];

            (service as any).pickUpItem(mockRoom, testPlayer, ItemType.Flag);

            expect(testPlayer.playerInGame.inventory).toContain(ItemType.Flag);
            expect(mockRoom.game.map.placedItems).toHaveLength(0);
            expect(messagingGateway.sendItemPickupJournal).toHaveBeenCalled();
            expect(gameStatsService.processItemPickupStats).toHaveBeenCalled();
        });
    });

    describe('setItemAtPosition', () => {
        it('should place item at specified position', () => {
            const map = { placedItems: [] } as Map;
            const item = { type: ItemType.Flag, position: { x: 0, y: 0 } };
            const newPosition = { x: 1, y: 1 };

            (service as any).setItemAtPosition(item, map, newPosition);

            expect(map.placedItems).toContain(item);
            expect(item.position).toEqual(newPosition);
        });
    });

    describe('removeItemFromInventory', () => {
        it('should remove specified item from inventory', () => {
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.Flag, ItemType.SapphireFins];

            (service as any).removeItemFromInventory(ItemType.Flag, testPlayer);

            expect(testPlayer.playerInGame.inventory).not.toContain(ItemType.Flag);
            expect(testPlayer.playerInGame.inventory).toContain(ItemType.SapphireFins);
        });
    });

    describe('isItemGrabbable', () => {
        it('should return false for start items', () => {
            const result = (service as any).isItemGrabbable(ItemType.Start);
            expect(result).toBe(false);
        });

        it('should return true for other items', () => {
            const result = (service as any).isItemGrabbable(ItemType.Flag);
            expect(result).toBe(true);
        });
    });

    describe('isItemInInventory', () => {
        it('should return true when item is in inventory', () => {
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.Flag];

            const result = (service as any).isItemInInventory(testPlayer, ItemType.Flag);

            expect(result).toBe(true);
        });

        it('should return false when item is not in inventory', () => {
            const testPlayer = { ...mockPlayer };
            testPlayer.playerInGame.inventory = [ItemType.SapphireFins];

            const result = (service as any).isItemInInventory(testPlayer, ItemType.Flag);

            expect(result).toBe(false);
        });
    });

    describe('handleHammerUsed', () => {
        it('should remove last tile from affectedTiles if affectedPlayers has more than one element', () => {
            const mockRoom = createMockRoom();
            const affectedPlayers = [mockPlayer, mockAIPlayer];
            const affectedTiles = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ];

            specialItemService.handleHammerUsed.mockReturnValue(affectedPlayers);
            specialItemService.determineHammerAffectedTiles.mockReturnValue({
                affectedTiles,
                overWorldAction: { action: 2, position: { x: 0, y: 0 } },
            });

            service.handleItemUsed(mockRoom, 'test', {
                type: ItemType.GraniteHammer,
                usagePosition: { x: 0, y: 0 },
            });

            expect(affectedTiles).toEqual([{ x: 0, y: 0 }]);
        });

        it('should not modify affectedTiles if affectedPlayers has one or fewer elements', () => {
            const mockRoom = createMockRoom();
            const affectedPlayers = [mockPlayer];
            const affectedTiles = [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ];

            specialItemService.handleHammerUsed.mockReturnValue(affectedPlayers);
            specialItemService.determineHammerAffectedTiles.mockReturnValue({
                affectedTiles,
                overWorldAction: { action: 2, position: { x: 0, y: 0 } },
            });

            service.handleItemUsed(mockRoom, 'test', {
                type: ItemType.GraniteHammer,
                usagePosition: { x: 0, y: 0 },
            });

            expect(affectedTiles).toEqual([
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ]);
        });
    });

    it('should handle normal item loss and place item at nearest valid position', () => {
        const mockRoom = createMockRoom();
        const testPlayer = { ...mockPlayer };
        testPlayer.playerInGame.inventory = [ItemType.Flag];
        roomManagerService.getPlayerInRoom.mockReturnValue(testPlayer);
        const itemDropPosition = { x: 0, y: 0 };
        const newItemPosition = { x: 1, y: 1 };
        pathFindingService.findNearestValidPosition.mockReturnValue(newItemPosition);

        const result = (service as any).loseItem(mockRoom, testPlayer, {
            itemType: ItemType.Flag,
            itemDropPosition,
            isUsedSpecialItem: false,
        });

        expect(result.type).toBe(ItemType.Flag);
        expect(result.position).toEqual(newItemPosition);
        expect(mockRoom.game.map.placedItems).toHaveLength(1);
        expect(testPlayer.playerInGame.inventory).toHaveLength(0);
    });
});
