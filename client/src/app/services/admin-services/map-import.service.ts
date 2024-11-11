import { Injectable } from '@angular/core';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { JsonValidationService } from './json-validation.service';
import { Map } from '@common/interfaces/map';
import { REQUIRED_MAP_FIELDS } from '@app/constants/admin.constants';

@Injectable({
    providedIn: 'root',
})
export class MapImportService {
    constructor(
        private mapValidationService: MapValidationService,
        private jsonValidationService: JsonValidationService,
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
                const importedMap: Map = this.convertToMap(cleanedMap);
                console.log('Converted Map:', importedMap);

                const jsonValidation = this.jsonValidationService.validateMap(importedMap);

                if (!jsonValidation.isValid) {
                    console.log(jsonValidation.message);
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
}
