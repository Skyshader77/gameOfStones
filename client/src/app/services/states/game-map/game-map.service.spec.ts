import { TestBed } from '@angular/core/testing';
import { BLANK_MAP } from '@common/constants/game-map.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Item } from '@common/interfaces/item';
import { Map } from '@common/interfaces/map';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMapService } from './game-map.service';

describe('GameMapService', () => {
    let service: GameMapService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameMapService);

        service.map = {
            ...BLANK_MAP,
            placedItems: [
                { type: ItemType.BismuthShield, position: { x: 1, y: 1 } },
                { type: ItemType.QuartzSkates, position: { x: 2, y: 2 } },
            ],
        } as Map;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add a new item to placedItems', () => {
        const newItem: Item = {
            type: ItemType.BismuthShield,
            position: { x: 1, y: 1 },
        };

        service.map.placedItems = [];

        service.updateItemsAfterPlaced(newItem);

        expect(service.map.placedItems.length).toBe(1);
        expect(service.map.placedItems[0]).toEqual(newItem);
    });

    it('should deep clone the item when adding it to placedItems', () => {
        const newItem: Item = {
            type: ItemType.BismuthShield,
            position: { x: 1, y: 1 },
        };
        service.updateItemsAfterPlaced(newItem);
        newItem.position = { x: 2, y: 2 };
        expect(service.map.placedItems[0].position).toEqual({ x: 1, y: 1 });
    });

    it('should add multiple items to placedItems', () => {
        const item1: Item = {
            type: ItemType.BismuthShield,
            position: { x: 1, y: 1 },
        };

        const item2: Item = {
            type: ItemType.QuartzSkates,
            position: { x: 2, y: 2 },
        };

        service.map.placedItems = [];

        service.updateItemsAfterPlaced(item1);
        service.updateItemsAfterPlaced(item2);

        expect(service.map.placedItems.length).toBe(2);
        expect(service.map.placedItems[0]).toEqual(item1);
        expect(service.map.placedItems[1]).toEqual(item2);
    });

    it('should not remove other items when one type is removed', () => {
        const itemTypeToRemove = ItemType.BismuthShield;
        service.updateItemsAfterPickup(itemTypeToRemove);
        const remainingQuartzSkates = service.map.placedItems.find((item) => item.type === ItemType.QuartzSkates);
        expect(remainingQuartzSkates).not.toBeNull();
    });

    it('should remove the item from placedItems after pickup', () => {
        const itemTypeToRemove = ItemType.BismuthShield;
        service.updateItemsAfterPickup(itemTypeToRemove);
        const remainingItems = service.map.placedItems.filter((item) => item.type === itemTypeToRemove);
        expect(remainingItems.length).toBe(0);
    });

    it('should update the door state at the specified position', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 };
        const newTerrain = TileTerrain.OpenDoor;
        service.updateDoorState(newTerrain, doorPosition);
        expect(service.map.mapArray[doorPosition.y][doorPosition.x]).toBe(newTerrain);
    });

    it('should handle different terrain types', () => {
        const position: Vec2 = { x: 1, y: 1 };
        const terrainTypes = [TileTerrain.Grass, TileTerrain.Wall, TileTerrain.Water];
        terrainTypes.forEach((terrain) => {
            service.updateDoorState(terrain, position);
            expect(service.map.mapArray[position.y][position.x]).toBe(terrain);
        });
    });

    it('should preserve other map tiles when updating a door', () => {
        const initialMap = JSON.parse(JSON.stringify(service.map.mapArray));
        const position: Vec2 = { x: 1, y: 1 };
        service.updateDoorState(TileTerrain.OpenDoor, position);
        for (let y = 0; y < service.map.size; y++) {
            for (let x = 0; x < service.map.size; x++) {
                if (x !== position.x || y !== position.y) {
                    expect(service.map.mapArray[y][x]).toBe(initialMap[y][x]);
                }
            }
        }
    });
});
