import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { mockMaps, mockNewMap } from '@app/constants/tests.constants';
import { Map } from '@app/interfaces/map';
import { of, throwError } from 'rxjs';
import { MapAPIService } from './map-api.service';
import { MapListService } from './map-list.service';

describe('MapListService', () => {
    let service: MapListService;
    let mapAPIServiceSpy: jasmine.SpyObj<MapAPIService>;

    const sampleMaps: Map[] = mockMaps;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('MapAPIService', ['getMaps']);

        TestBed.configureTestingModule({
            providers: [MapListService, { provide: MapAPIService, useValue: spy }, provideHttpClientTesting()],
        });

        service = TestBed.inject(MapListService);
        mapAPIServiceSpy = TestBed.inject(MapAPIService) as jasmine.SpyObj<MapAPIService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start with empty maps and not loaded', () => {
        expect(service.serviceMaps).toEqual([]);
        expect(service.isLoaded).toBeFalse();
    });

    it('should initialize and load maps from API', () => {
        mapAPIServiceSpy.getMaps.and.returnValue(of(sampleMaps));
        service.initialize();
        expect(service.serviceMaps).toEqual(sampleMaps);
        expect(service.isLoaded).toBeTrue();
    });

    it('should handle error when fetching maps from API', () => {
        const errorResponse = new Error('API error');
        mapAPIServiceSpy.getMaps.and.returnValue(throwError(() => errorResponse));
        service.initialize();
        expect(service.serviceMaps).toEqual([]);
        expect(service.isLoaded).toBeFalse();
    });

    it('should delete a map', () => {
        mapAPIServiceSpy.getMaps.and.returnValue(of(sampleMaps));
        service.initialize();

        service.deleteMapOnUI(sampleMaps[0]);

        expect(service.serviceMaps.length).toBe(sampleMaps.length - 1);
        expect(service.serviceMaps[0]._id).toBe('F35jsf');
    });

    it('should update a map', () => {
        mapAPIServiceSpy.getMaps.and.returnValue(of(sampleMaps));
        service.initialize();
        service.updateMapOnUI(mockNewMap);
        expect(service.serviceMaps[0].name).toBe(mockNewMap.name);
    });
});
