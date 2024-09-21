import { Injectable } from '@angular/core';
import { CreationMap, Item, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from './map-manager.service';

@Injectable({
    providedIn: 'root',
})
export class MapValidationService {
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

        // Find a starting point (a tile that is not a wall)
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

        // Check if all non-wall tiles have been visited
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

            // Check bounds and if the cell is already visited or a wall
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
        return row === 0 || row === mapSize - 1 || col === 0 || col === mapSize - 1;
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
        return true;
    }

    areAllStartPointsPlaced(): boolean {
        return this.mapManagerService.isItemLimitReached(Item.START);
    }

    validateMap(map: CreationMap): boolean {
        let isMapValid = true;
        isMapValid =
            this.isDoorAndWallNumberValid(map) &&
            this.isWholeMapAccessible(map) &&
            this.areAllStartPointsPlaced() &&
            this.areDoorSurroundingsValid(map);
        return isMapValid;
    }
}
