import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MapValidationService } from '@app/services/edit-page-services/map-validation/map-validation.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { MapAPIService } from '@app/services/api-services/map-api/map-api.service';
import { MapImportService } from './map-import.service';
import { JsonValidationService } from '@app/services/admin-services/json-validation/json-validation.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { ModalMessage } from '@app/interfaces/modal-message';
import { MOCK_ID, MOCK_INVALID_RAW_MAP_DATA, MOCK_RAW_MAP_DATA } from '@app/constants/json.constants';
import { of } from 'rxjs';

const mockModalMessageService = {
    showMessage: jasmine.createSpy('showMessage'),
    inputMessage$: jasmine.createSpyObj('inputMessage$', ['pipe']),
};

const mockMapListService = {
    initialize: jasmine.createSpy('initialize'),
};

describe('MapImportService', () => {
    let service: MapImportService;
    let mockJsonValidationService: jasmine.SpyObj<JsonValidationService>;
    let mockMapValidationService: jasmine.SpyObj<MapValidationService>;
    let mockMapApiService: jasmine.SpyObj<MapAPIService>;

    beforeEach(() => {
        mockJsonValidationService = jasmine.createSpyObj('JsonValidationService', ['validateMap']);
        mockMapValidationService = jasmine.createSpyObj('MapValidationService', ['validateMap']);
        mockMapApiService = jasmine.createSpyObj('MockMapAPIService', ['checkMapByName', 'createMap']);
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
});
