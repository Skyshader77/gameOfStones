import { Injectable } from '@angular/core';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { Map } from '@common/interfaces/map';
import { REQUIRED_MAP_FIELDS } from '@app/constants/admin.constants';
import { MapSize } from '@common/enums/map-size.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

@Injectable({
    providedIn: 'root',
})
export class MapImportService {
    constructor(private mapValidationService: MapValidationService) {}

    importMap() {
        this.fileUpload();
    }

    private fileUpload() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.click();
        fileInput.onchange = (event: Event) => {
            const input = event.target as HTMLInputElement;
            if (input && input.files && input.files[0]) {
                const file = input.files[0];
                this.handleFile(file);
            }
        };
    }

    private handleFile(file: File) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const jsonContent = JSON.parse(reader.result as string);
                console.log('Imported map data:', jsonContent);
                const missingFields = REQUIRED_MAP_FIELDS.filter((field) => !(field in jsonContent));

                if (missingFields.length > 0) {
                    console.error('Missing required fields:', missingFields);
                    return;
                }
                const cleanedMap = this.cleanImportedMap(jsonContent);
                const importedMap: Map = this.convertToMap(cleanedMap);
                console.log('Converted Map:', importedMap);

                const validationSize = this.validateSize(importedMap);
                if (!validationSize.isValid) {
                    console.error('Invalid map:', validationSize.message);
                    return;
                }

                const validationResult = this.validateMap(importedMap);
                if (!validationResult.isValid) {
                    console.error('Invalid map:', validationResult.message);
                    return;
                }

                const itemValidation = this.validateItems(importedMap);
                if (!itemValidation.isValid) {
                    console.error('Invalid map:', itemValidation.message);
                    return;
                }

                this.mapValidationService.validateImportedMap(importedMap);
                console.log(this.mapValidationService.validateMap(importedMap));
            } catch (error) {
                console.error('Error reading file:', error);
            }
        };

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
        };
        reader.readAsText(file);
    }

    private convertToMap(json: any): Map {
        const map: Map = {
            ...json,
            isVisible: false,
        };
        return map;
    }

    private cleanImportedMap(jsonContent: any): Map {
        const cleanedMap = Object.keys(jsonContent)
            .filter((key) => REQUIRED_MAP_FIELDS.includes(key))
            .reduce((obj, key) => {
                (obj as any)[key] = jsonContent[key];
                return obj;
            }, {});
        const map = cleanedMap as Map;
        map.isVisible = map.isVisible ?? false;
        map.imageData = map.imageData ?? undefined;

        return map;
    }

    private validateMap(map: Map) {
        let isValid = true;
        let message = '';

        const validSizes = [MapSize.Small, MapSize.Medium, MapSize.Large];
        if (!validSizes.includes(map.size)) {
            isValid = false;
            message = `Invalid map size: ${map.size}. It must be 10, 15, or 20.`;
        }

        if (isValid) {
            const expectedDimensions = map.size;
            if (!map.mapArray || map.mapArray.length !== expectedDimensions) {
                isValid = false;
                message = `mapArray must have ${expectedDimensions} rows.`;
            } else {
                for (const row of map.mapArray) {
                    if (row.length !== expectedDimensions) {
                        isValid = false;
                        message = `Each row in mapArray must have ${expectedDimensions} columns.`;
                        break;
                    }
                    for (const value of row) {
                        if (value < TileTerrain.Grass || value > TileTerrain.ClosedDoor) {
                            isValid = false;
                            message = `Each value in mapArray must be between 0 and 5. Found value: ${value}.`;
                            break;
                        }
                    }
                }
            }
        }

        return { isValid, message };
    }

    private validateSize(map: Map) {
        let isValid = true;
        let message = '';

        const validSizes = [MapSize.Small, MapSize.Medium, MapSize.Large];
        if (!validSizes.includes(map.size)) {
            isValid = false;
            message = `Invalid map size: ${map.size}. It must be 10, 15, or 20.`;
        }

        return { isValid, message };
    }

    private validateItems(map: Map) {
        let isValid = true;
        let message = '';

        for (const item of map.placedItems) {
            if (item.type < ItemType.Boost1 || item.type > ItemType.None) {
                isValid = false;
                message = `Item type must be between 0 and 9. Found item type: ${item.type}.`;
                break;
            }

            if ([item.position.x, item.position.y].some((val) => val < 0 || val > 19)) {
                isValid = false;
                message = `Item position x and y must be between 0 and 19. Found position: (${item.position.x}, ${item.position.y}).`;
                break;
            }
        }

        return { isValid, message };
    }
}
