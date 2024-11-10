import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { ItemManagerService } from './item-manager.service';
import { MAX_INVENTORY_SIZE } from '@common/constants/player.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MOCK_NEW_PLAYER_ORGANIZER } from '@app/constants/gameplay.test.constants';
import { MOCK_ITEM1, MOCK_ROOM_ITEMS } from '@app/constants/item-test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { Player } from '@common/interfaces/player';
import { Item } from '@app/interfaces/item';

describe('ItemManagerService', () => {
    let service: ItemManagerService;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;

    beforeEach(async () => {
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [ItemManagerService, Logger, { provide: RoomManagerService, useValue: roomManagerService }],
        }).compile();

        service = module.get<ItemManagerService>(ItemManagerService);
    });

    describe('getPlayerTileItem', () => {
        it('should return item when player is on same position as item', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;

            mockPlayer.playerInGame.currentPosition = { x: 1, y: 1 };

            const result = service.getPlayerTileItem(mockRoom, mockPlayer);
            expect(result).toEqual(MOCK_ITEM1);
        });

        it('should return null when no item is present on player position', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.currentPosition = { x: 0, y: 0 };

            const result = service.getPlayerTileItem(mockRoom, mockPlayer);
            expect(result).toBeNull();
        });
    });

    describe('isInventoryFull', () => {
        it('should return true when inventory is at max size', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.inventory = Array(MAX_INVENTORY_SIZE).fill(ItemType.Boost1);

            const result = service.isInventoryFull(mockPlayer);
            expect(result).toBeTruthy();
        });

        it('should return false when inventory is not full', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.inventory = [ItemType.Boost1];

            const result = service.isInventoryFull(mockPlayer);
            expect(result).toBeFalsy();
        });
    });

    describe('pickUpItem', () => {
        it('should add item to player inventory and remove from map', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            const itemType = ItemType.Boost1;

            service.pickUpItem(mockRoom, mockPlayer, itemType);

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

            service.setItemAtPosition(mockItem, mockMap, newPosition);

            expect(mockItem.position).toEqual(newPosition);
            expect(mockMap.placedItems).toContain(mockItem);
        });
    });

    describe('removeItemFromInventory', () => {
        it('should remove specified item from player inventory', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.inventory = [ItemType.Boost1, ItemType.Boost2];

            service.removeItemFromInventory(ItemType.Boost1, mockPlayer);

            expect(mockPlayer.playerInGame.inventory).not.toContain(ItemType.Boost1);
            expect(mockPlayer.playerInGame.inventory).toContain(ItemType.Boost2);
        });
    });

    describe('isItemGrabbable', () => {
        it('should return false for non-grabbable items', () => {
            expect(service.isItemGrabbable(ItemType.None)).toBeFalsy();
            expect(service.isItemGrabbable(ItemType.Start)).toBeFalsy();
        });

        it('should return true for grabbable items', () => {
            expect(service.isItemGrabbable(ItemType.Boost1)).toBeTruthy();
            expect(service.isItemGrabbable(ItemType.Boost2)).toBeTruthy();
        });
    });

    describe('isItemInInventory', () => {
        it('should return true when item exists in inventory', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.inventory = [ItemType.Boost1];

            const result = service.isItemInInventory(mockPlayer, ItemType.Boost1);
            expect(result).toBeTruthy();
        });

        it('should return false when item does not exist in inventory', () => {
            const mockPlayer = JSON.parse(JSON.stringify(MOCK_NEW_PLAYER_ORGANIZER)) as Player;
            mockPlayer.playerInGame.inventory = [ItemType.Boost1];

            const result = service.isItemInInventory(mockPlayer, ItemType.Boost2);
            expect(result).toBeFalsy();
        });
    });

    describe('isValidTerrainForItem', () => {
        it('should return true for valid terrain types', () => {
            const position: Vec2 = { x: 0, y: 0 };
            const mapArray = [[TileTerrain.Ice]];

            expect(service.isValidTerrainForItem(position, mapArray)).toBeTruthy();

            mapArray[0][0] = TileTerrain.Grass;
            expect(service.isValidTerrainForItem(position, mapArray)).toBeTruthy();

            mapArray[0][0] = TileTerrain.Water;
            expect(service.isValidTerrainForItem(position, mapArray)).toBeTruthy();
        });

        it('should return false for invalid terrain types', () => {
            const position: Vec2 = { x: 0, y: 0 };
            const mapArray = [[TileTerrain.Wall]];

            expect(service.isValidTerrainForItem(position, mapArray)).toBeFalsy();
        });
    });

    describe('isItemOnTile', () => {
        it('should return true when item exists on tile', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const mockMap = mockRoom.game.map;
            const position: Vec2 = { x: 1, y: 1 };

            const result = service.isItemOnTile(position, mockMap);
            expect(result).toBeTruthy();
        });

        it('should return false when no item exists on tile', () => {
            const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const mockMap = mockRoom.game.map;
            const position: Vec2 = { x: 0, y: 0 };

            const result = service.isItemOnTile(position, mockMap);
            expect(result).toBeFalsy();
        });
    });
});
