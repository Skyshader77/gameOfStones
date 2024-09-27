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
        mapListSpy = jasmine.createSpyObj('MapListService', ['getMaps', 'getMapbyId'], { serviceMaps: mockMaps });
        TestBed.configureTestingModule({
            providers: [{ provide: MapListService, useValue: mapListSpy }, provideHttpClientTesting()],
        });
        service = TestBed.inject(MapSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have no selection after initialization', () => {
        service.initialize();
        expect(service.selectedMap).toBeNull();
    });
    it('should return the selected map when selection', () => {
        service.initialize();
        service.chooseSelectedMap(0);
        expect(service.selectedMap).toBe(mapsMock[0]);
        expect(service.selection).toBe(0);
    });
});
