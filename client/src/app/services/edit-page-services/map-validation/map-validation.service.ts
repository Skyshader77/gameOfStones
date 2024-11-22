import { Injectable } from '@angular/core';
import { VALIDATION_ERRORS } from '@app/constants/edit-page.constants';
import { DIVISION_FACTOR, MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, POWER } from '@app/constants/validation.constants';
import { ValidationResult, ValidationStatus } from '@app/interfaces/validation';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { CreationMap } from '@common/interfaces/map';
import { Direction, directionToVec2Map } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { MapManagerService } from '@app/services/edit-page-services/map-manager/map-manager.service';

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
        const isMapValid = Object.values(validations).every((check) => check === true) === true && flagPlaced === true;

        const validationStatus: ValidationStatus = {
            ...validations,
            flagPlaced,
            isMapValid,
        };

        return { validationStatus, message: this.constructValidationMessage(validationStatus) };
    }

    validateImportMap(map: CreationMap) {
        this.mapManagerService.currentMap = map;
        return this.validateMap(map);
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
        return doorOrWallTileNumber < map.size ** POWER / DIVISION_FACTOR;
    }

    private isWholeMapAccessible(map: CreationMap): boolean {
        const visited = Array.from({ length: map.size }, () => Array(map.size).fill(false));
        const startingPosition = this.findStartingPosition(map);
        if (!startingPosition) return false;

        this.floodFill(startingPosition, visited, map);
        return this.allAccessibleTilesVisited(map, visited);
    }

    private findStartingPosition(map: CreationMap): Vec2 | null {
        for (let currentRow = 0; currentRow < map.size; currentRow++) {
            for (let currentCol = 0; currentCol < map.size; currentCol++) {
                if (map.mapArray[currentRow][currentCol] !== TileTerrain.Wall) {
                    return { x: currentCol, y: currentRow };
                }
            }
        }
        return null;
    }

    private allAccessibleTilesVisited(map: CreationMap, visited: boolean[][]): boolean {
        for (let currentRow = 0; currentRow < map.size; currentRow++) {
            for (let currentCol = 0; currentCol < map.size; currentCol++) {
                if (map.mapArray[currentRow][currentCol] !== TileTerrain.Wall && !visited[currentRow][currentCol]) {
                    return false;
                }
            }
        }
        return true;
    }

    private floodFill(position: Vec2, visited: boolean[][], map: CreationMap): void {
        if (!this.isValidPosition(position, visited, map)) return;

        visited[position.y][position.x] = true;

        for (const direction of Object.values(Direction)) {
            const displacement = directionToVec2Map[direction];
            const newPosition = { x: position.x + displacement.x, y: position.y + displacement.y };
            this.floodFill(newPosition, visited, map);
        }
    }

    private isValidPosition(position: Vec2, visited: boolean[][], map: CreationMap): boolean {
        return (
            position.y >= 0 &&
            position.y < map.size &&
            position.x >= 0 &&
            position.x < map.size &&
            !visited[position.y][position.x] &&
            map.mapArray[position.y][position.x] !== TileTerrain.Wall
        );
    }

    private isDoorOnEdge(position: Vec2, mapSize: number): boolean {
        return position.y === 0 || position.y === mapSize - 1 || position.x === 0 || position.x === mapSize - 1;
    }

    private isWall(position: Vec2, map: CreationMap): boolean {
        return map.mapArray[position.y] && map.mapArray[position.y][position.x] === TileTerrain.Wall;
    }

    private isDoorBetweenTwoWalls(position: Vec2, map: CreationMap): boolean {
        return (
            (this.isWall({ x: position.x, y: position.y + 1 }, map) && this.isWall({ x: position.x, y: position.y - 1 }, map)) ||
            (this.isWall({ x: position.x + 1, y: position.y }, map) && this.isWall({ x: position.x - 1, y: position.y }, map))
        );
    }

    private isTerrain(position: Vec2, map: CreationMap, terrains: TileTerrain[]): boolean {
        return map.mapArray[position.y] && terrains.includes(map.mapArray[position.y][position.x]);
    }

    private isDoorBetweenTwoTerrainTiles(position: Vec2, map: CreationMap): boolean {
        const terrains = [TileTerrain.Ice, TileTerrain.Grass, TileTerrain.Water];
        return (
            (this.isTerrain({ x: position.x + 1, y: position.y }, map, terrains) &&
                this.isTerrain({ x: position.x - 1, y: position.y }, map, terrains)) ||
            (this.isTerrain({ x: position.x, y: position.y + 1 }, map, terrains) &&
                this.isTerrain({ x: position.x, y: position.y - 1 }, map, terrains))
        );
    }

    private areDoorSurroundingsValid(map: CreationMap): boolean {
        return !map.mapArray.find((row, rowIndex) =>
            row.find((currentTile, colIndex) => {
                const position: Vec2 = { x: colIndex, y: rowIndex };
                return (
                    (currentTile === TileTerrain.ClosedDoor || currentTile === TileTerrain.OpenDoor) &&
                    (this.isDoorOnEdge(position, map.size) ||
                        !this.isDoorBetweenTwoWalls(position, map) ||
                        !this.isDoorBetweenTwoTerrainTiles(position, map))
                );
            }),
        );
    }

    private areAllStartPointsPlaced(): boolean {
        return this.mapManagerService.isItemLimitReached(ItemType.Start);
    }

    private areAllItemsPlaced(map: CreationMap): boolean {
        return (
            map.placedItems.filter((item) => {
                return item.type !== ItemType.Start && item.type !== ItemType.Flag;
            }).length === this.mapManagerService.getMaxItems()
        );
    }

    private isFlagPlaced(): boolean {
        return this.mapManagerService.isItemLimitReached(ItemType.Flag);
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
