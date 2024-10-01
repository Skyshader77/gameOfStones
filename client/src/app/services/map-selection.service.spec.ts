import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { mockMaps } from '@app/constants/tests.constants';
import { MapListService } from './map-list.service';
import { MapSelectionService } from './map-selection.service';

describe('MapSelectionService', () => {
    let service: MapSelectionService;
    let mapListSpy: jasmine.SpyObj<MapListService>;
    const mapsMock = mockMaps;

    beforeEach(() => {
        mapListSpy = jasmine.createSpyObj('MapListService', ['initialize'], { serviceMaps: mockMaps });
        TestBed.configureTestingModule({
            providers: [{ provide: MapListService, useValue: mapListSpy }, provideHttpClientTesting()],
        });
        service = TestBed.inject(MapSelectionService);
        service.initialize();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize mapListService during initialization', () => {
        expect(mapListSpy.initialize).toHaveBeenCalled();
    });

    it('should have no selection after initialization', () => {
        expect(service.selectedMap).toBeNull();
    });
    it('should return the selected map', () => {
        service.chooseSelectedMap(1);
        expect(service.selectedMap).toBe(mapsMock[1]);
        expect(service['selection']).toBe(1);
    });

    it('should return the selected map when selection is visible', () => {
        service.chooseVisibleMap(1);
        expect(service.selectedMap).toBe(mapsMock[2]);
        expect(service['selection']).toBe(2);
    });

    it('should stay at a selected map when selection is not visible', () => {
        service.chooseVisibleMap(0);
        expect(service.selectedMap).toBe(mapsMock[1]);
        expect(service['selection']).toBe(1);
    });
});
