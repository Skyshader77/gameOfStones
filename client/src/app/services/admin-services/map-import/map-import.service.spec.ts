import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MapValidationService } from '@app/services/edit-page-services/map-validation/map-validation.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { MapAPIService } from '@app/services/api-services/map-api/map-api.service';
import { MapImportService } from './map-import.service';
import { JsonValidationService } from '@app/services/admin-services/json-validation/json-validation.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
// import { MOCK_VALID_JSON_DATA } from '@app/constants/json.constants';
import { ModalMessage } from '@app/interfaces/modal-message';

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

    // it('should return error for invalid json validation', () => {
    //     mockJsonValidationService.validateMap.and.returnValue({
    //         isValid: false,
    //         message: 'Validation Error'
    //     });

    //     const result = (service as any).reportMapAndDataErrors(MOCK_VALID_JSON_DATA);

    //     expect(result).toBeTruthy();
    //     expect(result.isValid).toBeFalsy();
    //     expect(result.message.content).toBe('Validation Error');
    // });

    // describe('createMapFromJson', () => {
    //     it('should correctly transform raw map data to CreationMap', () => {
    //         const result = (service as any).createMapFromJson(MOCK_VALID_JSON_DATA);

    //         expect(result).toEqual(MOCK_VALID_JSON_DATA);
    //     });
    // });
});
