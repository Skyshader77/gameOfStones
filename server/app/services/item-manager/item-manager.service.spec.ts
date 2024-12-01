import { MOCK_NEW_PLAYER_ORGANIZER } from '@app/constants/gameplay.test.constants';
import {
    MOCK_GAMES_RANDOM_ITEMS,
    MOCK_ITEM1,
    MOCK_NEW_PLAYER_INVENTORY_EXCESS,
    MOCK_ROOM_ITEMS,
    MOCK_ROOM_ITEMS_EXCESS,
} from '@app/constants/item-test.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { SpecialItemService } from '@app/services/special-item/special-item.service';
import { MAX_INVENTORY_SIZE } from '@common/constants/player.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ItemManagerService } from './item-manager.service';
describe('ItemManagerService', () => {
    let service: ItemManagerService;
    let messagingGateway: SinonStubbedInstance<MessagingGateway>;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let socketManagerService: SinonStubbedInstance<SocketManagerService>;
    let gameStatsService: SinonStubbedInstance<GameStatsService>;
    let pathfindingService: SinonStubbedInstance<PathFindingService>;
    let specialItemService: SinonStubbedInstance<SpecialItemService>;
    beforeEach(async () => {
        messagingGateway = createStubInstance<MessagingGateway>(MessagingGateway);
        gameStatsService = createStubInstance<GameStatsService>(GameStatsService);
        pathfindingService = createStubInstance<PathFindingService>(PathFindingService);
        specialItemService = createStubInstance<SpecialItemService>(SpecialItemService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ItemManagerService,
                Logger,
                { provide: MessagingGateway, useValue: messagingGateway },
                { provide: RoomManagerService, useValue: roomManagerService },
                { provide: SocketManagerService, useValue: socketManagerService },
                { provide: GameStatsService, useValue: gameStatsService },
                { provide: PathFindingService, useValue: pathfindingService },
                { provide: SpecialItemService, useValue: specialItemService },
                SocketManagerService,
                {
                    provide: SocketManagerService,
                    useValue: socketManagerService,
                },
            ],
        }).compile();
        socketManagerService = module.get(SocketManagerService);
        service = module.get<ItemManagerService>(ItemManagerService);
    });

    describe('getPlayerTileItem', () => {
        it('should return item when player is on same position as item', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;

            mockPlayer.playerInGame.currentPosition = { x: 1, y: 1 };
            const result = service['getPlayerTileItem'](mockRoom, mockPlayer);
            expect(result).toEqual(MOCK_ITEM1);
        });

        it('should return null when no item is present on player position', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.currentPosition = { x: 0, y: 0 };
            const result = service['getPlayerTileItem'](mockRoom, mockPlayer);
            expect(result).toBeNull();
        });
    });

    describe('isInventoryFull', () => {
        it('should return true when inventory is at max size', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.inventory = Array(MAX_INVENTORY_SIZE).fill(ItemType.BismuthShield);
            const result = service['isInventoryFull'](mockPlayer);
            expect(result).toBeTruthy();
        });

        it('should return false when inventory is not full', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.inventory = [ItemType.BismuthShield];
            const result = service['isInventoryFull'](mockPlayer);
            expect(result).toBeFalsy();
        });
    });

    describe('pickUpItem', () => {
        it('should add item to player inventory and remove from map', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            const itemType = ItemType.BismuthShield;
            service['pickUpItem'](mockRoom, mockPlayer, itemType);

            expect(mockPlayer.playerInGame.inventory).toContain(itemType);
            expect(mockRoom.game.map.placedItems).not.toContainEqual(expect.objectContaining({ type: itemType }));
        });
    });

    describe('setItemAtPosition', () => {
        it('should set item position and add to map', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const mockMap = mockRoom.game.map;
            const mockItem = JSON.parse(JSON.stringify(MOCK_ITEM1)) as Item;
            const newPosition: Vec2 = { x: 3, y: 3 };
            service['setItemAtPosition'](mockItem, mockMap, newPosition);

            expect(mockItem.position).toEqual(newPosition);
            expect(mockMap.placedItems).toContain(mockItem);
        });
    });

    describe('removeItemFromInventory', () => {
        it('should remove specified item from player inventory', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.inventory = [ItemType.BismuthShield, ItemType.GlassStone];
            service['removeItemFromInventory'](ItemType.BismuthShield, mockPlayer);

            expect(mockPlayer.playerInGame.inventory).not.toContain(ItemType.BismuthShield);
            expect(mockPlayer.playerInGame.inventory).toContain(ItemType.GlassStone);
        });
    });

    describe('isItemGrabbable', () => {
        it('should return false for non-grabbable items', () => {
            expect(service['isItemGrabbable'](ItemType.Start)).toBeFalsy();
        });

        it('should return true for grabbable items', () => {
            expect(service['isItemGrabbable'](ItemType.BismuthShield)).toBeTruthy();
            expect(service['isItemGrabbable'](ItemType.GlassStone)).toBeTruthy();
        });
    });

    describe('isItemInInventory', () => {
        it('should return true when item exists in inventory', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.inventory = [ItemType.BismuthShield];
            const result = service['isItemInInventory'](mockPlayer, ItemType.BismuthShield);
            expect(result).toBeTruthy();
        });

        it('should return false when item does not exist in inventory', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.inventory = [ItemType.BismuthShield];
            const result = service['isItemInInventory'](mockPlayer, ItemType.GlassStone);
            expect(result).toBeFalsy();
        });
    });

    describe('hasToDropItem', () => {
        it('should return true when player inventory is over max size', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_INVENTORY_EXCESS)) as Player;
            const result = service.hasToDropItem(mockPlayer);
            expect(result).toBeTruthy();
        });

        it('should return false when player inventory is less than or equal to max size', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            const result = service.hasToDropItem(mockPlayer);
            expect(result).toBeFalsy();
        });
    });
    describe('dropItem', () => {
        it('should remove item from player inventory and place it on the map', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS_EXCESS)) as RoomGame;
            const mockPlayer = mockRoom.players[0];
            const itemType = ItemType.BismuthShield;
            const droppedItem = service['dropItem'](mockRoom, mockPlayer, itemType);

            expect(mockPlayer.playerInGame.inventory).not.toContain(itemType);
            expect(mockRoom.game.map.placedItems).toContain(droppedItem);
        });
        it('should place the item at the  current position of the player', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS_EXCESS)) as RoomGame;
            const mockPlayer = mockRoom.players[0];
            mockPlayer.playerInGame.currentPosition = { x: 0, y: 0 };
            const itemType = ItemType.BismuthShield;
            const droppedItem = service['dropItem'](mockRoom, mockPlayer, itemType);

            expect(droppedItem.position).toEqual({ x: 0, y: 0 });
        });
    });
    describe('loseItem', () => {
        it('should remove item from player inventory and place it on the map', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS_EXCESS)) as RoomGame;
            const mockPlayer = mockRoom.players[0];
            const itemType = ItemType.BismuthShield;
            pathfindingService.findNearestValidPosition.returns({ x: 1, y: 1 });
            const droppedItem = service['loseItem'](mockRoom, mockPlayer, itemType, { x: 0, y: 0 }, false);

            expect(mockPlayer.playerInGame.inventory).not.toContain(itemType);
            expect(mockRoom.game.map.placedItems).toContain(droppedItem);
        });

        it('should return null if item is not in player inventory', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const mockPlayer = mockRoom.players[0];
            const itemType = ItemType.GlassStone;
            const droppedItem = service['loseItem'](mockRoom, mockPlayer, itemType, { x: 0, y: 0 }, false);

            expect(droppedItem).toBeUndefined();
        });
    });

    describe('placeRandomItems', () => {
        it('should replace random items with available item types', () => {
            const mockRoom = JSON.parse(
                JSON.stringify({
                    ...MOCK_ROOM_ITEMS,
                    game: MOCK_GAMES_RANDOM_ITEMS.gameWithItems,
                }),
            ) as RoomGame;

            service.placeRandomItems(mockRoom);

            const hasRandomItems = mockRoom.game.map.placedItems.some((item: Item) => item.type === ItemType.Random);
            expect(hasRandomItems).toBeFalsy();
        });

        it('should not modify non-random items', () => {
            const mockRoom = JSON.parse(
                JSON.stringify({
                    ...MOCK_ROOM_ITEMS,
                    game: MOCK_GAMES_RANDOM_ITEMS.gameWithItems,
                }),
            ) as RoomGame;

            const originalNonRandomItems = mockRoom.game.map.placedItems
                .filter((item: Item) => item.type !== ItemType.Random)
                .map((item: Item) => ({ ...item }));

            service.placeRandomItems(mockRoom);

            const unchangedItems = mockRoom.game.map.placedItems.filter((item: Item) => {
                return originalNonRandomItems.some(
                    (original) => original.position.x === item.position.x && original.position.y === item.position.y && original.type === item.type,
                );
            });

            expect(unchangedItems.length).toBe(originalNonRandomItems.length);
        });

        it('should not use Start item type as replacement', () => {
            const mockRoom = JSON.parse(
                JSON.stringify({
                    ...MOCK_ROOM_ITEMS,
                    game: MOCK_GAMES_RANDOM_ITEMS.gameWithItems,
                }),
            ) as RoomGame;

            service.placeRandomItems(mockRoom);

            const hasStartItems = mockRoom.game.map.placedItems.some((item: Item) => item.type === ItemType.Start);
            expect(hasStartItems).toBeFalsy();
        });

        it('should not duplicate existing item types', () => {
            const mockRoom = JSON.parse(
                JSON.stringify({
                    ...MOCK_ROOM_ITEMS,
                    game: MOCK_GAMES_RANDOM_ITEMS.gameWithItems,
                }),
            ) as RoomGame;

            service.placeRandomItems(mockRoom);

            const itemTypes = mockRoom.game.map.placedItems.map((item: Item) => item.type);
            const uniqueItemTypes = new Set(itemTypes);

            expect(itemTypes.length).toBe(uniqueItemTypes.size);
        });

        it('should maintain item positions when replacing random items', () => {
            const mockRoom = JSON.parse(
                JSON.stringify({
                    ...MOCK_ROOM_ITEMS,
                    game: MOCK_GAMES_RANDOM_ITEMS.gameWithItems,
                }),
            ) as RoomGame;

            const originalRandomItemPositions = mockRoom.game.map.placedItems
                .filter((item: Item) => item.type === ItemType.Random)
                .map((item: Item) => ({ ...item.position }));

            service.placeRandomItems(mockRoom);

            const replacedItemPositions = mockRoom.game.map.placedItems.filter((item: Item) =>
                originalRandomItemPositions.some((pos) => pos.x === item.position.x && pos.y === item.position.y),
            );

            expect(replacedItemPositions.length).toBe(originalRandomItemPositions.length);
        });
    });
});
