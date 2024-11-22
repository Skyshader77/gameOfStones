import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MapValidationService } from '@app/services/edit-page-services/map-validation/map-validation.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { MapAPIService } from '@app/services/api-services/map-api/map-api.service';
import { MapImportService } from './map-import.service';
import { JsonValidationService } from '../json-validation/json-validation.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';

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
