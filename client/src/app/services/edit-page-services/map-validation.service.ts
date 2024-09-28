import { Injectable } from '@angular/core';
import { CreationMap, GameMode, Item, TileTerrain } from '@app/interfaces/map';
import { ValidationStatus } from '@app/interfaces/validation';
import { MapManagerService } from './map-manager.service';

@Injectable({
    providedIn: 'root',
})
export class MapValidationService {
    validationStatus: ValidationStatus = {
        doorAndWallNumberValid: false,
        wholeMapAccessible: false,
        allStartPointsPlaced: false,
        doorSurroundingsValid: false,
        flagPlaced: false,
        allItemsPlaced: false,
        nameValid: false,
        descriptionValid: false,
        isMapValid: false,
    };

    constructor(private mapManagerService: MapManagerService) {}

    isDoorAndWallNumberValid(map: CreationMap): boolean {
        let doorOrWallTileNumber = 0;
        for (const row of map.mapArray) {
            for (const tile of row) {
                if (tile.terrain === TileTerrain.CLOSEDDOOR || tile.terrain === TileTerrain.OPENDOOR || tile.terrain === TileTerrain.WALL) {
                    doorOrWallTileNumber++;
                }
            }
        }
        return doorOrWallTileNumber < map.size ** 2 / 2;
    }

    isWholeMapAccessible(map: CreationMap): boolean {
        const visited = Array(map.size)
            .fill(null)
            .map(() => Array(map.size).fill(false));

        let startRow = -1;
        let startCol = -1;
        for (let currentRow = 0; currentRow < map.size; currentRow++) {
            for (let currentCol = 0; currentCol < map.size; currentCol++) {
                if (!(map.mapArray[currentRow][currentCol].terrain === TileTerrain.WALL)) {
                    startRow = currentRow;
                    startCol = currentCol;
                    break;
                }
            }
            if (startRow !== -1) break;
        }

        if (startRow === -1 || startCol === -1) return false;

        this.floodFill(startRow, startCol, visited, map);

        for (let currentRow = 0; currentRow < map.size; currentRow++) {
            for (let currentCol = 0; currentCol < map.size; currentCol++) {
                if (!(map.mapArray[currentRow][currentCol].terrain === TileTerrain.WALL) && !visited[currentRow][currentCol]) {
                    return false;
                }
            }
        }
        return true;
    }

    floodFill(row: number, col: number, visited: boolean[][], map: CreationMap): void {
        const queue: [number, number][] = [[row, col]];
        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ];

        while (queue.length > 0) {
            const [currentRow, currentCol] = queue.shift() || [];

            if (
                currentRow === undefined ||
                currentCol === undefined ||
                currentRow < 0 ||
                currentRow >= map.size ||
                currentCol < 0 ||
                currentCol >= map.size ||
                visited[currentRow][currentCol] ||
                map.mapArray[currentRow][currentCol].terrain === TileTerrain.WALL
            ) {
                continue;
            }

            visited[currentRow][currentCol] = true;

            // Enqueue all valid neighbors
            for (const [dx, dy] of directions) {
                queue.push([currentRow + dx, currentCol + dy]);
            }
        }
    }

    isDoorOnEdge(row: number, col: number, mapSize: number) {
        return row % mapSize === 0 || col % mapSize === 0;
    }

    isDoorBetweenTwoWalls(row: number, col: number, map: CreationMap) {
        return (
            (map.mapArray[row + 1][col].terrain === TileTerrain.WALL && map.mapArray[row - 1][col].terrain === TileTerrain.WALL) ||
            (map.mapArray[row][col + 1].terrain === TileTerrain.WALL && map.mapArray[row][col - 1].terrain === TileTerrain.WALL)
        );
    }

    isDoorBetweenTwoTerrainTiles(row: number, col: number, map: CreationMap) {
        return (
            ([TileTerrain.ICE, TileTerrain.GRASS, TileTerrain.WATER].includes(map.mapArray[row][col + 1].terrain) &&
                [TileTerrain.ICE, TileTerrain.GRASS, TileTerrain.WATER].includes(map.mapArray[row][col - 1].terrain)) ||
            ([TileTerrain.ICE, TileTerrain.GRASS, TileTerrain.WATER].includes(map.mapArray[row + 1][col].terrain) &&
                [TileTerrain.ICE, TileTerrain.GRASS, TileTerrain.WATER].includes(map.mapArray[row - 1][col].terrain))
        );
    }

    areDoorSurroundingsValid(map: CreationMap): boolean {
        for (let row = 0; row < map.size; row++) {
            for (let col = 0; col < map.size; col++) {
                const currentTile = map.mapArray[row][col];
                if (currentTile.terrain === TileTerrain.CLOSEDDOOR || currentTile.terrain === TileTerrain.OPENDOOR) {
                    if (this.isDoorOnEdge(row, col, map.size)) {
                        return false;
                    }
                    if (!this.isDoorBetweenTwoWalls(row, col, map)) {
                        return false;
                    }
                    if (!this.isDoorBetweenTwoTerrainTiles(row, col, map)) {
                        return false;
                    }
                }
            }
        }
        return true; // CHANGER POUR UN FIND
    }

    areAllStartPointsPlaced(): boolean {
        return this.mapManagerService.isItemLimitReached(Item.START);
    }

    areAllItemsPlaced(map: CreationMap): boolean {
        return map.placedItems.filter((item) => item !== Item.START && item !== Item.FLAG).length === this.mapManagerService.getMaxItems();
    }

    isFlagPlaced(): boolean {
        return this.mapManagerService.isItemLimitReached(Item.FLAG);
    }

    isNameValid(mapName: string): boolean {
        return mapName.trim().length > 0;
    }

    isDescriptionValid(mapDescription: string): boolean {
        return mapDescription.trim().length > 0;
    }

    validateMap(map: CreationMap) {
        this.validationStatus.doorAndWallNumberValid = this.isDoorAndWallNumberValid(map);
        this.validationStatus.wholeMapAccessible = this.isWholeMapAccessible(map);
        this.validationStatus.allStartPointsPlaced = this.areAllStartPointsPlaced();
        this.validationStatus.allItemsPlaced = this.areAllItemsPlaced(map);
        this.validationStatus.doorSurroundingsValid = this.areDoorSurroundingsValid(map);
        this.validationStatus.nameValid = this.isNameValid(map.name);
        this.validationStatus.descriptionValid = this.isDescriptionValid(map.description);

        this.validationStatus.isMapValid =
            this.validationStatus.doorAndWallNumberValid &&
            this.validationStatus.wholeMapAccessible &&
            this.validationStatus.allStartPointsPlaced &&
            this.validationStatus.allItemsPlaced &&
            this.validationStatus.doorSurroundingsValid &&
            this.validationStatus.nameValid &&
            this.validationStatus.descriptionValid;

        this.validationStatus.flagPlaced = map.mode === GameMode.CTF ? this.isFlagPlaced() : true;
        this.validationStatus.isMapValid = this.validationStatus.isMapValid && this.validationStatus.flagPlaced;

        return this.validationStatus;
    }
}
