import { Injectable } from '@angular/core';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { JsonValidationService } from './json-validation.service';
import { CreationMap } from '@common/interfaces/map';
import { REQUIRED_MAP_FIELDS } from '@app/constants/admin.constants';
import { MapAPIService } from '../api-services/map-api.service';

@Injectable({
    providedIn: 'root',
})
export class MapImportService {
    constructor(
        private mapValidationService: MapValidationService,
        private jsonValidationService: JsonValidationService,
        private mapApiService: MapAPIService,
    ) {}

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
                const importedMap: CreationMap = this.convertToMap(cleanedMap);
                console.log('Converted Map:', importedMap);

                const jsonValidation = this.jsonValidationService.validateMap(importedMap);

                if (!jsonValidation.isValid) {
                    console.log(jsonValidation.message);
                    return;
                }

                this.mapValidationService.validateMap(importedMap);
                console.log(this.mapValidationService.validateMap(importedMap));
                this.checkIfMapNameExists(importedMap.name, importedMap);
            } catch (error) {
                console.error('Error reading file:', error);
            }
        };

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
        };
        reader.readAsText(file);
    }

    private convertToMap(json: any): CreationMap {
        const map: CreationMap = {
            name: json.name,
            description: json.description,
            size: json.size,
            mode: json.mode,
            mapArray: json.mapArray,
            placedItems: json.placedItems,
            imageData: json.imageData,
    };

    return map;
    }

    private cleanImportedMap(jsonContent: any): CreationMap {
        const cleanedMap = Object.keys(jsonContent)
            .filter((key) => REQUIRED_MAP_FIELDS.includes(key))
            .reduce((obj, key) => {
                (obj as any)[key] = jsonContent[key];
                return obj;
            }, {});
        const map = cleanedMap as CreationMap;

        return map;
    }

    private checkIfMapNameExists(mapName: string, importedMap: CreationMap) {
        this.mapApiService.checkMapByName(mapName).subscribe({
            next: (exists) => {
                if (exists) {
                    console.error(`A map with the name "${mapName}" already exists.`);
                } else {
                    console.log("Map can be created");
                    this.mapApiService.createMap(importedMap).subscribe({
                        next: (response) => {
                            console.log('Map created successfully:', response);
                        },
                        error: (error) => {
                            console.error('Error creating map:', error);
                        },
                    });
                }
            },
            error: (error) => {
                console.error('Error checking map name:', error);
            }
        });
    }
}
