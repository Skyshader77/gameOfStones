import { Injectable } from '@angular/core';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { JsonValidationService } from './json-validation.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list.service';
import { CreationMap } from '@common/interfaces/map';
import {
    REQUIRED_MAP_FIELDS,
    CHAMP_MANQUANT,
    CHAMPS_MANQUANTS,
    JSON_MISSING_FIELDS,
    INVALID_JSON_FILE_TITLE,
    INVALID_JSON_FILE_MESSAGE,
    MAP_EXISTS_TITLE,
    MAP_EXISTS_MESSAGE,
    MAP_EXISTS_PLACEHOLDER,
    FILE_UPLOAD,
    FILE_UPLOAD_TYPE,
    FILE_UPLOAD_EXTENSION,
    INVALID_MAP_TITLE,
    IMPORT_SUCCESS_TITLE,
    IMPORT_SUCCESS_MESSAGE,
} from '@app/constants/admin.constants';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { ModalMessage } from '@app/interfaces/modal-message';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { take } from 'rxjs';
import { RawMapData } from '@app/interfaces/raw-map-data';

@Injectable({
    providedIn: 'root',
})
export class MapImportService {
    constructor(
        private mapValidationService: MapValidationService,
        private jsonValidationService: JsonValidationService,
        private mapApiService: MapAPIService,
        private modalMessageService: ModalMessageService,
        private mapListService: MapListService,
    ) {}

    importMap() {
        this.fileUpload();
    }

    private fileUpload() {
        const fileInput = document.createElement(FILE_UPLOAD);
        fileInput.type = FILE_UPLOAD_TYPE;
        fileInput.accept = FILE_UPLOAD_EXTENSION;
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
                const rawContent = JSON.parse(reader.result as string);

                const structureValidation = this.validateJsonStructure(rawContent);
                if (structureValidation) {
                    this.modalMessageService.showMessage(structureValidation.message);
                    return;
                }

                const jsonContent = rawContent as RawMapData;
                const validationResult = this.validateMapData(jsonContent);
                if (validationResult) {
                    this.modalMessageService.showMessage(validationResult.message);
                    return;
                }

                const importedMap = this.createMapFromJson(jsonContent);
                this.checkIfMapNameExists(importedMap.name, importedMap);
            } catch (error) {
                const errorMessage: ModalMessage = {
                    title: INVALID_JSON_FILE_TITLE,
                    content: INVALID_JSON_FILE_MESSAGE,
                };
                this.modalMessageService.showMessage(errorMessage);
            }
        };
        reader.readAsText(file);
    }

    private validateJsonStructure(json: unknown): { isValid: boolean; message: ModalMessage } | void {
        const missingFields = REQUIRED_MAP_FIELDS.filter((field) => !json || typeof json !== 'object' || !(field in json));

        if (missingFields.length > 0) {
            const missingFieldsString = missingFields.map((field) => JSON_MISSING_FIELDS[field as keyof typeof JSON_MISSING_FIELDS]).join('\n');

            const messageContent = missingFields.length === 1 ? CHAMP_MANQUANT : CHAMPS_MANQUANTS;
            return {
                isValid: false,
                message: {
                    title: messageContent,
                    content: `${messageContent}\n${missingFieldsString}`,
                },
            };
        }
    }

    private validateMapData(jsonContent: RawMapData): { isValid: boolean; message: ModalMessage } | void {
        const map = this.createMapFromJson(jsonContent);

        const jsonValidation = this.jsonValidationService.validateMap(map);
        if (!jsonValidation.isValid) {
            return {
                isValid: false,
                message: {
                    title: INVALID_JSON_FILE_TITLE,
                    content: jsonValidation.message,
                },
            };
        }

        const mapValidation = this.mapValidationService.validateImportMap(map);
        if (!mapValidation.validationStatus.isMapValid) {
            return {
                isValid: false,
                message: {
                    title: INVALID_MAP_TITLE,
                    content: mapValidation.message,
                },
            };
        }
    }

    private createMapFromJson(jsonContent: RawMapData): CreationMap {
        const map: CreationMap = {
            name: jsonContent.name,
            description: jsonContent.description,
            size: jsonContent.size,
            mode: jsonContent.mode,
            mapArray: jsonContent.mapArray,
            placedItems: jsonContent.placedItems,
            imageData: jsonContent.imageData,
        };

        return map;
    }

    private checkIfMapNameExists(mapName: string, importedMap: CreationMap): void {
        this.mapApiService.checkMapByName(mapName).subscribe({
            next: (exists) => {
                if (exists) {
                    this.handleMapExists(importedMap);
                } else {
                    this.createMap(importedMap);
                }
            },
        });
    }

    private handleMapExists(importedMap: CreationMap): void {
        const message: ModalMessage = {
            title: MAP_EXISTS_TITLE,
            content: MAP_EXISTS_MESSAGE,
            inputRequired: true,
            inputPlaceholder: MAP_EXISTS_PLACEHOLDER,
        };
        this.modalMessageService.showMessage(message);
        this.modalMessageService.inputMessage$.pipe(take(1)).subscribe({
            next: (newName: string) => {
                importedMap.name = newName.trim();
                this.checkIfMapNameExists(newName.trim(), importedMap);
            },
        });
    }

    private createMap(importedMap: CreationMap): void {
        this.mapApiService.createMap(importedMap).subscribe({
            next: () => {
                const message: ModalMessage = {
                    title: IMPORT_SUCCESS_TITLE,
                    content: IMPORT_SUCCESS_MESSAGE,
                };
                this.modalMessageService.showMessage(message);
                this.mapListService.initialize();
            },
        });
    }
}
