import { Injectable } from '@angular/core';
import { CreationMap } from '@common/interfaces/map';
import { MapSize } from '@common/enums/map-size.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { JSON_VALIDATION_ERRORS } from '@app/constants/admin.constants';

@Injectable({
    providedIn: 'root',
})
export class JsonValidationService {
    validateMap(map: CreationMap): { isValid: boolean; message: string } {
        const errors: string[] = [];

        const sizeValidation = this.validateMapSize(map);
        if (!sizeValidation.isValid) {
            errors.push(sizeValidation.message);
            return { isValid: false, message: errors.join('\n') };
        }

        if (sizeValidation.isValid) {
            const dimensionsValidation = this.validateMapArrayDimensions(map);
            if (!dimensionsValidation.isValid) errors.push(dimensionsValidation.message);
        }

        const tileValidation = this.validateTileValues(map);
        if (!tileValidation.isValid) errors.push(tileValidation.message);

        const itemValidation = this.validateItems(map);
        if (!itemValidation.isValid) errors.push(itemValidation.message);

        if (errors.length > 0) {
            return { isValid: false, message: errors.join('\n') };
        }

        return { isValid: true, message: JSON_VALIDATION_ERRORS.successfulValidation };
    }

    private validateMapSize(map: CreationMap): { isValid: boolean; message: string } {
        const validSizes = [MapSize.Small, MapSize.Medium, MapSize.Large];
        if (!validSizes.includes(map.size)) {
            return {
                isValid: false,
                message: this.interpolateMessage(JSON_VALIDATION_ERRORS.invalidMapSize, { mapSize: map.size }),
            };
        }
        return { isValid: true, message: '' };
    }

    private validateMapArrayDimensions(map: CreationMap): { isValid: boolean; message: string } {
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

    private validateTileValues(map: CreationMap): { isValid: boolean; message: string } {
        for (const row of map.mapArray) {
            for (const value of row) {
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
            if (item.type < ItemType.Boost1 || item.type > ItemType.None) {
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
