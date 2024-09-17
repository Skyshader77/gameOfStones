import { TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GameMode, Map } from '@app/interfaces/map';
import { of } from 'rxjs';
import { MapAPIService } from './map-api.service';
import { MapSelectionService } from './map-selection.service';

describe('MapSelectionService', () => {
    let service: MapSelectionService;
    let mapAPISpy: jasmine.SpyObj<MapAPIService>;
    const mapsMock: Map[] = [
        {
            _id: '0',
            name: 'Mock Map 1',
            mapDescription: '',
            sizeRow: 0,
            mode: GameMode.NORMAL,
            mapArray: [],
            isVisible: true,
            dateOfLastModification: new Date(),
        },
        {
            _id: '1',
            name: 'Mock Map 2',
            mapDescription: '',
            sizeRow: 0,
            mode: GameMode.NORMAL,
            mapArray: [],
            isVisible: true,
            dateOfLastModification: new Date(),
        },
    ];

    beforeEach(() => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMaps', 'getMapbyId']);
        mapAPISpy.getMaps.and.returnValue(of(mapsMock));
        TestBed.configureTestingModule({
            providers: [{ provide: MapAPIService, useValue: mapAPISpy }, provideHttpClientTesting()],
        });
        service = TestBed.inject(MapSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be loaded after initialization', () => {
        service.initialize();
        expect(service.loaded).toBeTrue();
    });

    it('should have the map list after initialization', () => {
        service.initialize();
        expect(service.maps).toBe(mapsMock);
    });

    it('should have no selection after initialization', () => {
        service.initialize();
        expect(service.selectedMap).toBeNull();
    });

    it('should return the selected map when selection', () => {
        service.initialize();
        service.chooseSelectedMap(0);

        expect(service.selectedMap).toBe(mapsMock[0]);
    });
});
