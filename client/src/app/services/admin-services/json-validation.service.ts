import { Injectable } from '@angular/core';
import { CreationMap } from '@common/interfaces/map';
import { MapSize } from '@common/enums/map-size.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

@Injectable({
    providedIn: 'root',
})
export class JsonValidationService {
    validateMap(map: CreationMap): { isValid: boolean; message: string } {
        let result = this.validateMapSize(map);
        if (!result.isValid) return result;

        result = this.validateMapArrayDimensions(map);
        if (!result.isValid) return result;

        result = this.validateTileValues(map);
        if (!result.isValid) return result;

        result = this.validateItems(map);
        if (!result.isValid) return result;

        return { isValid: true, message: 'Validation successful' };
    }

    private validateMapSize(map: CreationMap): { isValid: boolean; message: string } {
        const validSizes = [MapSize.Small, MapSize.Medium, MapSize.Large];
        if (!validSizes.includes(map.size)) {
            return {
                isValid: false,
                message: `La taille de la carte est invalide: ${map.size}. Elle doit être 10, 15 ou 20.`,
            };
        }
        return { isValid: true, message: '' };
    }

    private validateMapArrayDimensions(map: CreationMap): { isValid: boolean; message: string } {
        const expectedDimensions = map.size;
        if (!map.mapArray || map.mapArray.length !== expectedDimensions) {
            return {
                isValid: false,
                message: `La carte n'a pas la bonne quantité de rangées. Elle doit avoir ${expectedDimensions} rangées.`,
            };
        }
        for (const row of map.mapArray) {
            if (row.length !== expectedDimensions) {
                return {
                    isValid: false,
                    message: `Chaque rangée de la carte doit avoir ${expectedDimensions} colonnes.`,
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
                        message: `Chaque valeur dans mapArray doit être entre 0 et 5. Valeur trouvée : ${value}.`,
                    };
                }
            }
        }
        return { isValid: true, message: '' };
    }

    private validateItems(map: CreationMap) {
        let isValid = true;
        let message = '';

        for (const item of map.placedItems) {
            if (item.type < ItemType.Boost1 || item.type > ItemType.None) {
                isValid = false;
                message = `Le type d'item doit être entre 0 et 9. ${item.type} a été trouvé.`;
                break;
            }

            if ([item.position.x, item.position.y].some((val) => val < 0 || val > map.size - 1)) {
                isValid = false;
                message = `Les positions des items doivent être comprises entre 0 et ${map.size - 1}. (${item.position.x}, ${
                    item.position.y
                }) a été trouvé.`;
                break;
            }
        }

        return { isValid, message };
    }
}
