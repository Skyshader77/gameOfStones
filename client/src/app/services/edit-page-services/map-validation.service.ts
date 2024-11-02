import { Injectable } from '@angular/core';
import { VALIDATION_ERRORS } from '@app/constants/edit-page.constants';
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from '@app/constants/validation.constants';
import { ValidationResult, ValidationStatus } from '@app/interfaces/validation';
import { Vec2 } from '@common/interfaces/vec2';
import { MapManagerService } from './map-manager.service';
import { GameMode } from '@common/enums/game-mode.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { Item } from '@common/interfaces/item';
import { CreationMap } from '@common/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class MapValidationService {
    constructor(private mapManagerService: MapManagerService) {}

    validateMap(map: CreationMap): ValidationResult {
        const validations = {
            doorAndWallNumberValid: this.isDoorAndWallNumberValid(map),
            wholeMapAccessible: this.isWholeMapAccessible(map),
            allStartPointsPlaced: this.areAllStartPointsPlaced(),
            allItemsPlaced: this.areAllItemsPlaced(map),
            doorSurroundingsValid: this.areDoorSurroundingsValid(map),
            nameValid: this.isNameValid(map.name),
            descriptionValid: this.isDescriptionValid(map.description),
        };

        const flagPlaced = map.mode === GameMode.CTF ? this.isFlagPlaced() : true;
        const isMapValid = Object.values(validations).every((check) => check === true) && flagPlaced;

        const validationStatus: ValidationStatus = {
            ...validations,
            flagPlaced,
            isMapValid,
        };

        return { validationStatus, message: this.constructValidationMessage(validationStatus) };
    }

    private isDoorAndWallNumberValid(map: CreationMap): boolean {
        let doorOrWallTileNumber = 0;
        for (const row of map.mapArray) {
            for (const tile of row) {
                if (tile === TileTerrain.ClosedDoor || tile === TileTerrain.OpenDoor || tile === TileTerrain.Wall) {
                    doorOrWallTileNumber++;
                }
            }
        }
        return doorOrWallTileNumber < map.size ** 2 / 2;
    }

    private isWholeMapAccessible(map: CreationMap): boolean {
        const visited = Array(map.size)
            .fill(null)
            .map(() => Array(map.size).fill(false));

        let startRow = -1;
        let startCol = -1;

        for (let currentRow = 0; currentRow < map.size; currentRow++) {
            for (let currentCol = 0; currentCol < map.size; currentCol++) {
                if (map.mapArray[currentRow][currentCol] !== TileTerrain.Wall) {
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
                if (map.mapArray[currentRow][currentCol] !== TileTerrain.Wall && !visited[currentRow][currentCol]) {
                    return false;
                }
            }
        }
        return true;
    }

    private floodFill(row: number, col: number, visited: boolean[][], map: CreationMap): void {
        if (!this.isValidPosition(row, col, visited, map)) {
            return;
        }

        visited[row][col] = true;

        const directions: Vec2[] = [
            { y: -1, x: 0 },
            { y: 1, x: 0 },
            { y: 0, x: -1 },
            { y: 0, x: 1 },
        ];

        for (const direction of directions) {
            this.floodFill(row + direction.y, col + direction.x, visited, map);
        }
    }

    private isValidPosition(row: number, column: number, visited: boolean[][], map: CreationMap): boolean {
        return (
            row >= 0 && row < map.size && column >= 0 && column < map.size && !visited[row][column] && map.mapArray[row][column] !== TileTerrain.Wall
        );
    }

    private isDoorOnEdge(row: number, col: number, mapSize: number) {
        return row % (mapSize - 1) === 0 || col % (mapSize - 1) === 0;
    }

    private isDoorBetweenTwoWalls(row: number, col: number, map: CreationMap) {
        const isWall = (r: number, c: number) => map.mapArray[r][c] === TileTerrain.Wall;

        return (isWall(row + 1, col) && isWall(row - 1, col)) || (isWall(row, col + 1) && isWall(row, col - 1));
    }

    private isDoorBetweenTwoTerrainTiles(row: number, col: number, map: CreationMap) {
        const terrains = [TileTerrain.Ice, TileTerrain.Grass, TileTerrain.Water];
        const isTerrain = (r: number, c: number) => terrains.includes(map.mapArray[r][c]);

        return (isTerrain(row, col + 1) && isTerrain(row, col - 1)) || (isTerrain(row + 1, col) && isTerrain(row - 1, col));
    }

    private areDoorSurroundingsValid(map: CreationMap): boolean {
        return !map.mapArray.find((row: TileTerrain[], rowIndex: number) =>
            row.find(
                (currentTile: TileTerrain, colIndex: number) =>
                    (currentTile === TileTerrain.ClosedDoor || currentTile === TileTerrain.OpenDoor) &&
                    (this.isDoorOnEdge(rowIndex, colIndex, map.size) ||
                        !this.isDoorBetweenTwoWalls(rowIndex, colIndex, map) ||
                        !this.isDoorBetweenTwoTerrainTiles(rowIndex, colIndex, map)),
            ),
        );
    }

    private areAllStartPointsPlaced(): boolean {
        return this.mapManagerService.isItemLimitReached(ItemType.START);
    }

    private areAllItemsPlaced(map: CreationMap): boolean {
        return (
            map.placedItems.filter((item: Item) => item.type !== ItemType.START && item.type !== ItemType.FLAG).length ===
            this.mapManagerService.getMaxItems()
        );
    }

    private isFlagPlaced(): boolean {
        return this.mapManagerService.isItemLimitReached(ItemType.FLAG);
    }

    private isNameValid(mapName: string): boolean {
        const trimmedName = mapName.trim();
        return trimmedName.length > 0 && trimmedName.length < MAX_NAME_LENGTH;
    }

    private isDescriptionValid(mapDescription: string): boolean {
        const trimmedDescription = mapDescription.trim();
        return trimmedDescription.length > 0 && trimmedDescription.length < MAX_DESCRIPTION_LENGTH;
    }

    private constructValidationMessage(validationStatus: ValidationStatus): string {
        const messages = Object.entries(VALIDATION_ERRORS)
            .filter(([key]) => !validationStatus[key as keyof typeof VALIDATION_ERRORS])
            .map(([, message]) => message);
        return messages.join('\n');
    }
}
