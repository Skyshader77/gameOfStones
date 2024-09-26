import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameMode, generateMapArray, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { of } from 'rxjs';
import { MEDIUM_MAP_SIZE, SMALL_MAP_SIZE } from 'src/app/constants/admin-API.constants';
import { MapAPIService } from './map-api.service';
import { MapSelectionService } from './map-selection.service';
import { MapListService } from './map-list.service';
describe('MapSelectionService', () => {
    let service: MapSelectionService;
    let mapAPISpy: jasmine.SpyObj<MapAPIService>;
    let mapListSpy: jasmine.SpyObj<MapListService >;
    const mapsMock: Map[] = [
        {
            _id: '0',
            name: 'Mock Map 1',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            placedItems: [Item.BOOST1, Item.BOOST2, Item.BOOST3],
            mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.GRASS),
            isVisible: true,
            dateOfLastModification: new Date(),
        },
        {
            _id: '1',
            name: 'Mock Map 2',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: generateMapArray(MEDIUM_MAP_SIZE, TileTerrain.ICE),
            placedItems: [Item.BOOST1, Item.BOOST5, Item.BOOST6, Item.BOOST4],
            isVisible: true,
            dateOfLastModification: new Date(),
        },
        {
            _id: '3',
            name: 'Mock Map 3',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: generateMapArray(MEDIUM_MAP_SIZE, TileTerrain.ICE),
            placedItems: [],
            isVisible: false,
            dateOfLastModification: new Date(),
        },
        {
            _id: '3',
            name: 'Mock Map 4',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.CTF,
            mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.WATER),
            placedItems: [Item.BOOST1, Item.BOOST2, Item.BOOST3, Item.BOOST4],
            isVisible: false,
            dateOfLastModification: new Date(),
        },
    ];

    beforeEach(() => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMaps', 'getMapbyId', 'getMapbyName', 'deleteMap', 'updateMap', 'createMap']);
        mapListSpy = jasmine.createSpyObj('MapListService', ['getMaps', 'getMapbyId']);
        mapAPISpy.getMaps.and.returnValue(of(mapsMock));
        TestBed.configureTestingModule({
            providers: [{ provide: MapAPIService, useValue: mapAPISpy }, { provide: MapListService, useValue: mapListSpy  }, provideHttpClientTesting()],
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
        expect(mapListSpy.maps).toBe(mapsMock);
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
