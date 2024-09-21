import { Injectable } from '@angular/core';
import * as consts from '@app/constants/edit-page-consts';
import { CreationMap, GameMode, Item, Map, TileTerrain } from '@app/interfaces/map';
import { ServerManagerService } from './server-manager.service';

@Injectable({
    providedIn: 'root',
})
export class MapManagerService {
    currentMap: CreationMap = {
        name: 'mapName',
        description: '',
        size: consts.SMALL_MAP_SIZE,
        mode: GameMode.CTF,
        mapArray: [],
        placedItems: [],
    };

    originalMap: CreationMap;
    draggedItemInitRow: number | null = null;
    draggedItemInitCol: number | null = null;
    mapId: string;

    selectedTileType: TileTerrain | null;

    constructor(private serverManagerService: ServerManagerService) {}

    onInit(mapId: string | null) {
        if (mapId) {
            this.serverManagerService.fetchMap(mapId).subscribe((map: Map) => {
                this.currentMap = map as CreationMap;
                this.originalMap = map as CreationMap;
                this.mapId = map._id;
            });
        } else {
            this.initializeMap();
        }
    }

    getMapSize(): number {
        return this.currentMap.size;
    }

    initializeMap(): void {
        this.currentMap.mapArray = Array.from({ length: this.currentMap.size }, () =>
            Array.from({ length: this.currentMap.size }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        );
        this.currentMap.placedItems = [];
        this.originalMap = {
            name: this.currentMap.name,
            description: this.currentMap.description,
            size: this.currentMap.size,
            mode: this.currentMap.mode,
            mapArray: this.currentMap.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
            placedItems: this.currentMap.placedItems.map((item) => item),
        };
    }

    selectTileType(type: TileTerrain | null): void {
        this.selectedTileType = type;
    }

    getMaxItems(): number {
        switch (this.currentMap.size) {
            case consts.SMALL_MAP_SIZE:
                return consts.SMALL_MAP_ITEM_LIMIT;
            case consts.MEDIUM_MAP_SIZE:
                return consts.MEDIUM_MAP_ITEM_LIMIT;
            case consts.LARGE_MAP_SIZE:
                return consts.LARGE_MAP_ITEM_LIMIT;
            default:
                return 0;
        }
    }

    resetMap() {
        this.currentMap.mapArray = this.originalMap.mapArray.map((row) => row.map((tile) => ({ ...tile })));
        this.currentMap.placedItems = this.originalMap.placedItems.map((item) => item);
    }

    isItemLimitReached(item: Item): boolean {
        if (item !== Item.RANDOM && item !== Item.START) {
            return this.currentMap.placedItems.includes(item);
        } else {
            const itemCount = this.currentMap.placedItems.filter((placedItem) => placedItem === item).length;
            return itemCount === this.getMaxItems();
        }
    }

    changeTile(rowIndex: number, colIndex: number, tileType: TileTerrain) {
        this.currentMap.mapArray[rowIndex][colIndex].terrain = tileType;
    }

    toggleDoor(rowIndex: number, colIndex: number) {
        const tile = this.currentMap.mapArray[rowIndex][colIndex];
        if (tile.terrain === TileTerrain.CLOSEDDOOR) {
            this.changeTile(rowIndex, colIndex, TileTerrain.OPENDOOR);
        } else {
            this.changeTile(rowIndex, colIndex, TileTerrain.CLOSEDDOOR);
        }
    }

    removeItem(rowIndex: number, colIndex: number) {
        const item: Item = this.currentMap.mapArray[rowIndex][colIndex].item;
        this.currentMap.mapArray[rowIndex][colIndex].item = Item.NONE;

        const index = this.currentMap.placedItems.indexOf(item);
        if (index !== -1) {
            this.currentMap.placedItems.splice(index, 1);
        }
    }

    addItem(rowIndex: number, colIndex: number, item: Item) {
        this.currentMap.mapArray[rowIndex][colIndex].item = item;
        this.currentMap.placedItems.push(item);
    }
}
