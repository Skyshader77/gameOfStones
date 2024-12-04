import { Injectable } from '@angular/core';
import {
    FILE_UPLOAD,
    FILE_UPLOAD_EXTENSION,
    FILE_UPLOAD_TYPE,
    IMPORT_SUCCESS_MESSAGE,
    IMPORT_SUCCESS_TITLE,
    INVALID_JSON_FILE_MESSAGE,
    INVALID_JSON_FILE_TITLE,
    INVALID_MAP_TITLE,
    JSON_MISSING_FIELDS,
    MAP_EXISTS_MESSAGE,
    MAP_EXISTS_PLACEHOLDER,
    MAP_EXISTS_TITLE,
    MISSING_FIELD,
    MISSING_FIELDS,
    REQUIRED_MAP_FIELDS,
} from '@app/constants/admin.constants';
import { ModalMessage } from '@app/interfaces/modal-message';
import { RawMapData } from '@app/interfaces/raw-map-data';
import { JsonValidationService } from '@app/services/admin-services/json-validation/json-validation.service';
import { MapAPIService } from '@app/services/api-services/map-api/map-api.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation/map-validation.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { CreationMap } from '@common/interfaces/map';
import { take } from 'rxjs';

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

                const jsonErrors = this.reportJsonFieldErrors(rawContent);
                if (jsonErrors) {
                    this.modalMessageService.showMessage(jsonErrors.message);
                    return;
                }

                const jsonContent = rawContent as RawMapData;
                const mapAndDataErrors = this.reportMapAndDataErrors(jsonContent);
                if (mapAndDataErrors) {
                    this.modalMessageService.showMessage(mapAndDataErrors.message);
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

    private reportJsonFieldErrors(json: unknown): { isValid: boolean; message: ModalMessage } | void {
        const missingFields = REQUIRED_MAP_FIELDS.filter((field) => !json || typeof json !== 'object' || !(field in json));

        if (missingFields.length > 0) {
            const missingFieldsString = missingFields.map((field) => JSON_MISSING_FIELDS[field as keyof typeof JSON_MISSING_FIELDS]).join('\n');

            const messageContent = missingFields.length === 1 ? MISSING_FIELD : MISSING_FIELDS;
            return {
                isValid: false,
                message: {
                    title: messageContent,
                    content: `${messageContent}\n${missingFieldsString}`,
                },
            };
        }
    }

    private reportMapAndDataErrors(jsonContent: RawMapData): { isValid: boolean; message: ModalMessage } | void {
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
