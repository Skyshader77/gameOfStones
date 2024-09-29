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
        mapAPIServiceSpy = jasmine.createSpyObj('MapAPIService', ['getMaps']);

        TestBed.configureTestingModule({
            providers: [MapListService, { provide: MapAPIService, useValue: mapAPIServiceSpy }, provideHttpClientTesting()],
        });
        service = TestBed.inject(MapListService);
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

        try {
            service.initialize();
        } catch (error) {
            expect(mapAPIServiceSpy.getMaps).toHaveBeenCalled();
            expect(service.isLoaded).toBeFalse();
            expect(service.serviceMaps).toEqual([]);
            expect(error instanceof Error).toBeTrue();
            expect((error as Error).message).toBe('Failed to load maps');
        }
    });

    it('should delete a map', () => {
        mapAPIServiceSpy.getMaps.and.returnValue(of(sampleMaps));
        service.initialize();

        service.deleteMapOnUI(sampleMaps[0]);

        expect(service.serviceMaps.length).toBe(sampleMaps.length - 1);
        expect(service.serviceMaps[0]._id).toBe(sampleMaps[1]._id);
    });

    it('should not delete a map if it is not in the list', () => {
        mapAPIServiceSpy.getMaps.and.returnValue(of([sampleMaps[0]]));
        service.initialize();

        service.deleteMapOnUI(sampleMaps[1]);

        expect(service.serviceMaps.length).toBe(1);
        expect(service.serviceMaps[0]._id).toBe(sampleMaps[0]._id);
    });

    it('should update a map', () => {
        mapAPIServiceSpy.getMaps.and.returnValue(of(sampleMaps));
        service.initialize();
        service.updateMapOnUI(mockNewMap);
        expect(service.serviceMaps[0].name).toBe(mockNewMap.name);
    });

    it('should not update a map if it is not in the list', () => {
        mapAPIServiceSpy.getMaps.and.returnValue(of([sampleMaps[1]]));
        service.initialize();
        service.updateMapOnUI(mockNewMap);
        expect(service.serviceMaps[0].name).not.toBe(mockNewMap.name);
    });
});
