import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MapImportService } from '../map-import.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { JsonValidationService } from './json-validation.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list.service';
import { MapAPIService } from '@app/services/api-services/map-api/map-api.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';

// Create mock services
const mockMapValidationService = {
    validateImportMap: jasmine.createSpy('validateImportMap'),
};

const mockJsonValidationService = {
    validateMap: jasmine.createSpy('validateMap'),
};

const mockMapApiService = {
    checkMapByName: jasmine.createSpy('checkMapByName'),
    createMap: jasmine.createSpy('createMap'),
};

const mockModalMessageService = {
    showMessage: jasmine.createSpy('showMessage'),
    inputMessage$: jasmine.createSpyObj('inputMessage$', ['pipe']),
};

const mockMapListService = {
    initialize: jasmine.createSpy('initialize'),
};

describe('MapImportService', () => {
    let service: MapImportService;

    beforeEach(() => {
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
});
