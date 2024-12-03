import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MOCK_ID, MOCK_INVALID_RAW_MAP_DATA, MOCK_RAW_MAP_DATA } from '@app/constants/json.constants';
import { ModalMessage } from '@app/interfaces/modal-message';
import { RawMapData } from '@app/interfaces/raw-map-data';
import { ValidationStatus } from '@app/interfaces/validation';
import { JsonValidationService } from '@app/services/admin-services/json-validation/json-validation.service';
import { MapAPIService } from '@app/services/api-services/map-api/map-api.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation/map-validation.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { of } from 'rxjs';
import { MapImportService } from './map-import.service';

let mockMapListService = {
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
        mockModalMessageService = jasmine.createSpyObj('ModalMessageService', [
            'showMessage',
            { inputMessage$: jasmine.createSpyObj('inputMessage$', ['pipe']) },
        ]);
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
        fileInputMock.onchange!(changeEvent);

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
});
