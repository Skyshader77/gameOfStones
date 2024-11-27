import { Injectable } from '@angular/core';
import { JSON_VALIDATION_ERRORS } from '@app/constants/admin.constants';
import { JsonValidationResult } from '@app/interfaces/validation';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { CreationMap } from '@common/interfaces/map';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class JsonValidationService {
    private validations: ((map: CreationMap) => JsonValidationResult)[] = [
        this.validateMapSize.bind(this),
        this.validateMapArrayDimensions.bind(this),
        this.validateGameMode.bind(this),
        this.validateTileValues.bind(this),
        this.validateItems.bind(this),
    ];

    validateMap(map: CreationMap): JsonValidationResult {
        for (const validation of this.validations) {
            const result = validation(map);
            if (!result.isValid) {
                return { isValid: false, message: result.message };
            }
        }

        return { isValid: true, message: JSON_VALIDATION_ERRORS.successfulValidation };
    }

    private validateMapSize(map: CreationMap): JsonValidationResult {
        const validSizes = [MapSize.Small, MapSize.Medium, MapSize.Large];
        if (!validSizes.includes(map.size)) {
            return {
                isValid: false,
                message: this.interpolateMessage(JSON_VALIDATION_ERRORS.invalidMapSize, { mapSize: map.size }),
            };
        }
        return { isValid: true, message: '' };
    }

    private validateGameMode(map: CreationMap): JsonValidationResult {
        const validSizes = [GameMode.Normal, GameMode.CTF];
        if (!validSizes.includes(map.mode)) {
            return {
                isValid: false,
                message: this.interpolateMessage(JSON_VALIDATION_ERRORS.invalidGameMode, { mapSize: map.mode }),
            };
        }
        return { isValid: true, message: '' };
    }

    private validateMapArrayDimensions(map: CreationMap): JsonValidationResult {
        const expectedDimensions = map.size;
        if (!map.mapArray || map.mapArray.length !== expectedDimensions) {
            return {
                isValid: false,
                message: this.interpolateMessage(JSON_VALIDATION_ERRORS.invalidRows, { expectedDimensions }),
            };
        }
        for (const row of map.mapArray) {
            if (row.length !== expectedDimensions) {
                return {
                    isValid: false,
                    message: this.interpolateMessage(JSON_VALIDATION_ERRORS.invalidColumns, { expectedDimensions }),
                };
            }
        }
        return { isValid: true, message: '' };
    }

    private validateTileValues(map: CreationMap): JsonValidationResult {
        for (const row of map.mapArray) {
            for (const value of row) {
                if (typeof value !== 'number') {
                    return {
                        isValid: false,
                        message: JSON_VALIDATION_ERRORS.invalidTile,
                    };
                }
                if (value < TileTerrain.Grass || value > TileTerrain.ClosedDoor) {
                    return {
                        isValid: false,
                        message: this.interpolateMessage(JSON_VALIDATION_ERRORS.invalidTileTypes, { value }),
                    };
                }
            }
        }
        return { isValid: true, message: '' };
    }

    private validateItems(map: CreationMap) {
        let isValid = true;
        let message = '';

        const itemPositions = new Set<string>();

        for (const item of map.placedItems) {
            if (item.type < ItemType.BismuthShield || item.type > ItemType.Flag) {
                isValid = false;
                message = this.interpolateMessage(JSON_VALIDATION_ERRORS.invalidItemTypes, { itemType: item.type });
                break;
            }

            if ([item.position.x, item.position.y].some((val) => val < 0 || val > map.size - 1)) {
                isValid = false;
                message = this.interpolateMessage(JSON_VALIDATION_ERRORS.invalidItemPositions, {
                    itemPosition: item.position,
                    maxSize: map.size - 1,
                });
                break;
            }

            const tileType = map.mapArray[item.position.y][item.position.x];
            if (![TileTerrain.Grass, TileTerrain.Ice, TileTerrain.Water].includes(tileType)) {
                isValid = false;
                message = this.interpolateMessage(JSON_VALIDATION_ERRORS.invalidItemTerrain, {
                    itemPosition: item.position,
                });
                break;
            }

            const positionKey = `${item.position.x},${item.position.y}`;
            if (itemPositions.has(positionKey)) {
                isValid = false;
                message = this.interpolateMessage(JSON_VALIDATION_ERRORS.invalidItemSuperposition, {
                    itemPosition: item.position,
                });
                break;
            }

            itemPositions.add(positionKey);
        }

        return { isValid, message };
    }

    private interpolateMessage(template: string, values: { [key: string]: string | number | Vec2 }): string {
        return template.replace(/\${(.*?)}/g, (_, key) => {
            const value = values[key];
            if (value && typeof value === 'object' && 'x' in value && 'y' in value) {
                return `(${value.x}, ${value.y})`;
            }
            return String(value ?? '');
        });
    }
}
