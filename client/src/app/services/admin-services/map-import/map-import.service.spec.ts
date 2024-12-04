/* eslint-disable */
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { JSON_MISSING_FIELDS, MAP_EXISTS_MESSAGE, MAP_EXISTS_PLACEHOLDER, MAP_EXISTS_TITLE, MISSING_FIELD } from '@app/constants/admin.constants';
import { MOCK_ID, MOCK_INVALID_RAW_MAP_DATA, MOCK_RAW_MAP_DATA } from '@app/constants/json.constants';
import { ModalMessage } from '@app/interfaces/modal-message';
import { RawMapData } from '@app/interfaces/raw-map-data';
import { ValidationStatus } from '@app/interfaces/validation';
import { JsonValidationService } from '@app/services/admin-services/json-validation/json-validation.service';
import { MapAPIService } from '@app/services/api-services/map-api/map-api.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation/map-validation.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { CreationMap } from '@common/interfaces/map';
import { of, Subject } from 'rxjs';
import { MapImportService } from './map-import.service';

const mockMapListService = {
    initialize: jasmine.createSpy('initialize'),
};

describe('MapImportService', () => {
    let service: MapImportService;
    let mockJsonValidationService: jasmine.SpyObj<JsonValidationService>;
    let mockMapValidationService: jasmine.SpyObj<MapValidationService>;
    let mockMapApiService: jasmine.SpyObj<MapAPIService>;
    let mockModalMessageService: jasmine.SpyObj<ModalMessageService>;

    beforeEach(() => {
        mockJsonValidationService = jasmine.createSpyObj('JsonValidationService', ['validateMap']);
        mockMapValidationService = jasmine.createSpyObj('MapValidationService', ['validateMap', 'validateImportMap']);
        mockMapApiService = jasmine.createSpyObj('MockMapAPIService', ['checkMapByName', 'createMap']);
        mockModalMessageService = jasmine.createSpyObj('ModalMessageService', ['showMessage', 'inputMessage$']);
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                MapImportService,
                { provide: MapValidationService, useValue: mockMapValidationService },
                { provide: JsonValidationService, useValue: mockJsonValidationService },
                { provide: MapAPIService, useValue: mockMapApiService },
                { provide: ModalMessageService, useValue: mockModalMessageService },
                { provide: MapListService, useValue: mockMapListService },
            ],
        });
        service = TestBed.inject(MapImportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('reportJsonFieldErrors', () => {
        it('should return error for missing required fields', () => {
            const emptyJson = {};
            const result = (
                service as unknown as {
                    reportJsonFieldErrors: (json: unknown) => {
                        isValid: boolean;
                        message: ModalMessage;
                    };
                }
            ).reportJsonFieldErrors(emptyJson);

            expect(result).toBeTruthy();
            expect(result.isValid).toBeFalsy();
        });
    });

    it('should trigger file upload flow', () => {
        const fileInputMock = jasmine.createSpyObj('HTMLInputElement', ['click'], {
            type: 'file',
            accept: '.json',
        });
        spyOn(document, 'createElement').and.returnValue(fileInputMock);

        const importMapSpy = spyOn(service, 'importMap').and.callThrough();

        service.importMap();

        expect(document.createElement).toHaveBeenCalledWith('input');
        expect(fileInputMock.click).toHaveBeenCalled();
        expect(importMapSpy).toHaveBeenCalled();
    });

    it('should correctly transform raw map data to CreationMap', () => {
        const result = service['createMapFromJson'](MOCK_RAW_MAP_DATA);
        expect(result).toEqual(MOCK_RAW_MAP_DATA);
    });

    it('should return undefined for valid json with all required fields', () => {
        const result = service['reportJsonFieldErrors'](MOCK_RAW_MAP_DATA);
        expect(result).toBeUndefined();
    });

    it('should return error for invalid json validation', () => {
        mockJsonValidationService.validateMap.and.returnValue({
            isValid: false,
            message: 'JSON Validation Error',
        });

        const result = service['reportMapAndDataErrors'](MOCK_INVALID_RAW_MAP_DATA) as {
            isValid: boolean;
            message: {
                title: string;
                content: string;
            };
        };

        expect(result).toBeTruthy();
        expect(result.message.content).toBe('JSON Validation Error');
    });

    it('should create map and show success message', () => {
        mockMapApiService.createMap.and.returnValue(of({ id: MOCK_ID }));

        service['createMap'](MOCK_RAW_MAP_DATA);

        expect(mockMapApiService.createMap).toHaveBeenCalledWith(MOCK_RAW_MAP_DATA);
        expect(mockModalMessageService.showMessage).toHaveBeenCalled();
        expect(mockMapListService.initialize).toHaveBeenCalled();
    });

    it('should create a file input element and handle file selection', () => {
        const mockFile = new File(['mock content'], 'mockFile.json', { type: 'application/json' });
        const fileInputMock = jasmine.createSpyObj('HTMLInputElement', ['click'], {
            type: 'file',
            accept: '.json',
            files: [mockFile],
        });

        spyOn(document, 'createElement').and.returnValue(fileInputMock);
        const handleFileSpy = spyOn(service as any, 'handleFile');

        service['fileUpload']();

        expect(document.createElement).toHaveBeenCalledWith('input');
        expect(fileInputMock.type).toBe('file');
        expect(fileInputMock.accept).toBe('.json');
        expect(fileInputMock.click).toHaveBeenCalled();

        const changeEvent = { target: { files: [mockFile] } } as unknown as Event;
        fileInputMock.onchange(changeEvent);

        expect(handleFileSpy).toHaveBeenCalledWith(mockFile);
    });

    it('should return an error if the JSON validation fails', () => {
        const rawMapData: RawMapData = { name: 'Invalid Map' } as unknown as RawMapData;
        const map = {};

        spyOn(service as any, 'createMapFromJson').and.returnValue(map);
        mockJsonValidationService.validateMap.and.returnValue({
            isValid: false,
            message: 'Invalid JSON structure',
        });

        const result = service['reportMapAndDataErrors'](rawMapData);

        expect(result).toEqual({
            isValid: false,
            message: {
                title: 'Fichier JSON invalide',
                content: 'Invalid JSON structure',
            },
        });
    });

    it('should return an error if the map validation fails', () => {
        const rawMapData: RawMapData = { name: 'Invalid Map' } as unknown as RawMapData;
        const map = {};

        spyOn(service as any, 'createMapFromJson').and.returnValue(map);
        mockJsonValidationService.validateMap.and.returnValue({
            isValid: true,
            message: '',
        });
        mockMapValidationService.validateImportMap.and.returnValue({
            validationStatus: { isMapValid: false } as ValidationStatus,
            message: 'Invalid map data',
        });

        const result = service['reportMapAndDataErrors'](rawMapData);

        expect(result).toEqual({
            isValid: false,
            message: {
                title: 'Carte invalide',
                content: 'Invalid map data',
            },
        });
    });

    it('should not return any error if both validations pass', () => {
        const rawMapData: RawMapData = { name: 'Valid Map' } as unknown as RawMapData;
        const map = {};

        spyOn(service as any, 'createMapFromJson').and.returnValue(map);
        mockJsonValidationService.validateMap.and.returnValue({
            isValid: true,
            message: '',
        });
        mockMapValidationService.validateImportMap.and.returnValue({
            validationStatus: { isMapValid: true } as ValidationStatus,
            message: '',
        });

        const result = service['reportMapAndDataErrors'](rawMapData);

        expect(result).toBeUndefined();
    });

    describe('handleFile', () => {
        it('should process valid JSON and not show any error', () => {
            const validFile = new File([JSON.stringify(MOCK_RAW_MAP_DATA)], 'validFile.json', { type: 'application/json' });

            const fileReaderSpy = jasmine.createSpyObj('FileReader', ['readAsText']);
            spyOn(window, 'FileReader').and.returnValue(fileReaderSpy);

            fileReaderSpy.result = JSON.stringify(MOCK_RAW_MAP_DATA);

            spyOn(service as any, 'reportJsonFieldErrors').and.returnValue(null);
            spyOn(service as any, 'reportMapAndDataErrors').and.returnValue(null);
            spyOn(service as any, 'createMapFromJson').and.returnValue({});
            spyOn(service as any, 'checkIfMapNameExists').and.stub();

            service['handleFile'](validFile);

            fileReaderSpy.onload();

            expect(mockModalMessageService.showMessage).not.toHaveBeenCalled();
        });
    });

    it('should show an error message for invalid JSON (parsing error)', () => {
        const validFile = new File([JSON.stringify(MOCK_RAW_MAP_DATA)], 'validFile.json', { type: 'application/json' });

        const fileReaderSpy = jasmine.createSpyObj('FileReader', ['readAsText']);
        spyOn(window, 'FileReader').and.returnValue(fileReaderSpy);

        spyOn(service as any, 'reportJsonFieldErrors').and.returnValue(null);
        spyOn(service as any, 'reportMapAndDataErrors').and.returnValue(null);
        spyOn(service as any, 'createMapFromJson').and.returnValue({});
        spyOn(service as any, 'checkIfMapNameExists').and.stub();

        service['handleFile'](validFile);

        fileReaderSpy.onload();

        expect(mockModalMessageService.showMessage).toHaveBeenCalledWith({
            title: 'Fichier JSON invalide',
            content: "Le fichier JSON téléversé n'est pas un fichier JSON valide.",
        });
    });

    it('should show an error message if there are JSON field errors', () => {
        const validFile = new File([JSON.stringify(MOCK_RAW_MAP_DATA)], 'validFile.json', { type: 'application/json' });

        const fileReaderSpy = jasmine.createSpyObj('FileReader', ['readAsText']);
        spyOn(window, 'FileReader').and.returnValue(fileReaderSpy);

        fileReaderSpy.result = JSON.stringify(MOCK_RAW_MAP_DATA);

        spyOn(service as any, 'reportJsonFieldErrors').and.returnValue({
            isValid: false,
            message: { title: 'Error', content: 'Missing required fields' },
        });
        spyOn(service as any, 'reportMapAndDataErrors').and.returnValue(null);
        spyOn(service as any, 'createMapFromJson').and.returnValue({});
        spyOn(service as any, 'checkIfMapNameExists').and.stub();

        service['handleFile'](validFile);

        fileReaderSpy.onload();

        expect(mockModalMessageService.showMessage).toHaveBeenCalledWith({
            title: 'Error',
            content: 'Missing required fields',
        });
    });

    it('should show an error message if there are map validation errors', () => {
        const validFile = new File([JSON.stringify(MOCK_RAW_MAP_DATA)], 'validFile.json', { type: 'application/json' });

        const fileReaderSpy = jasmine.createSpyObj('FileReader', ['readAsText']);
        spyOn(window, 'FileReader').and.returnValue(fileReaderSpy);

        fileReaderSpy.result = JSON.stringify(MOCK_RAW_MAP_DATA);

        spyOn(service as any, 'reportJsonFieldErrors').and.returnValue(null);
        spyOn(service as any, 'reportMapAndDataErrors').and.returnValue({
            isValid: false,
            message: { title: 'Error', content: 'Invalid map data' },
        });
        spyOn(service as any, 'createMapFromJson').and.returnValue({});
        spyOn(service as any, 'checkIfMapNameExists').and.stub();

        service['handleFile'](validFile);

        fileReaderSpy.onload();

        expect(mockModalMessageService.showMessage).toHaveBeenCalledWith({
            title: 'Error',
            content: 'Invalid map data',
        });
    });

    describe('checkIfMapNameExists', () => {
        it('should call handleMapExists when the map already exists', () => {
            const mockImportedMap: CreationMap = { name: 'Test Map' } as CreationMap;
            mockMapApiService['checkMapByName'].and.returnValue(of(true));
            spyOn(service as any, 'handleMapExists');

            service['checkIfMapNameExists'](mockImportedMap.name, mockImportedMap);

            expect(mockMapApiService.checkMapByName).toHaveBeenCalledWith(mockImportedMap.name);
            expect(service['handleMapExists']).toHaveBeenCalledWith(mockImportedMap);
        });
    });

    describe('checkIfMapNameExists', () => {
        it('should call createMap when the map does not exist', () => {
            const mockImportedMap: CreationMap = { name: 'Test Map' } as CreationMap;
            mockMapApiService['checkMapByName'].and.returnValue(of(false));
            spyOn(service as any, 'createMap');

            service['checkIfMapNameExists'](mockImportedMap.name, mockImportedMap);

            expect(mockMapApiService.checkMapByName).toHaveBeenCalledWith(mockImportedMap.name);
            expect(service['createMap']).toHaveBeenCalledWith(mockImportedMap);
        });
    });

    describe('handleMapExists', () => {
        it('should show a modal message when the map exists and call checkIfMapNameExists when the user provides a new name', () => {
            const mockImportedMap: CreationMap = { name: 'Existing Map' } as CreationMap;
            const newName = 'New Map Name';

            const inputMessageSubject = new Subject<string>();

            Object.assign(mockModalMessageService, {
                inputMessage$: inputMessageSubject.asObservable(),
            });

            spyOn(service as any, 'checkIfMapNameExists');

            service['handleMapExists'](mockImportedMap);

            inputMessageSubject.next(newName);

            expect(mockModalMessageService.showMessage).toHaveBeenCalledWith({
                title: MAP_EXISTS_TITLE,
                content: MAP_EXISTS_MESSAGE,
                inputRequired: true,
                inputPlaceholder: MAP_EXISTS_PLACEHOLDER,
            });

            expect(service['checkIfMapNameExists']).toHaveBeenCalledWith(newName.trim(), mockImportedMap);
        });
    });

    describe('reportJsonFieldErrors', () => {
        it('should return an error when one required field is missing', () => {
            const jsonWithMissingField = {
                description: 'Mock Valid Creation Map',
                size: MapSize.Small,
                mode: GameMode.Normal,
                mapArray: Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass)),
                placedItems: [
                    { position: { x: 0, y: 0 }, type: ItemType.SapphireFins },
                    { position: { x: 1, y: 1 }, type: ItemType.GlassStone },
                    { position: { x: 2, y: 2 }, type: ItemType.Start },
                    { position: { x: 3, y: 3 }, type: ItemType.Start },
                ],
                imageData: '',
            } as CreationMap;

            const result = service['reportJsonFieldErrors'](jsonWithMissingField);

            expect(result).toBeDefined();
            expect(result?.isValid).toBeFalse();
            expect(result?.message.title).toBe(MISSING_FIELD);
            expect(result?.message.content).toContain(MISSING_FIELD);
            expect(result?.message.content).toContain(JSON_MISSING_FIELDS['name']);
        });
    });
});
