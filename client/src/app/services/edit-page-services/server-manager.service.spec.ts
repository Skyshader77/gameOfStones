import { TestBed } from '@angular/core/testing';
import { GameMode, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { MapAPIService } from '@app/services/map-api.service';
import { ServerManagerService } from './server-manager.service';
import SpyObj = jasmine.SpyObj;

describe('ServerManagerService', () => {
    let service: ServerManagerService;
    let mapApiServiceSpy: SpyObj<MapAPIService>;

    const mockMapGrassOnly: Map = {
        _id: 'ABCDEF',
        name: 'Mock Map 1',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
        isVisible: true,
        dateOfLastModification: new Date(),
    };

    beforeEach(() => {
        mapApiServiceSpy = jasmine.createSpyObj('MapApiService', ['getMapById', 'updateMap', 'createMap'], {});
        TestBed.overrideProvider(MapAPIService, { useValue: mapApiServiceSpy });
        TestBed.configureTestingModule({
            providers: [ServerManagerService],
        });
        service = TestBed.inject(ServerManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call getMapById when fetchMap is called', () => {
        service.fetchMap(mockMapGrassOnly._id);
        expect(mapApiServiceSpy.getMapById).toHaveBeenCalled();
    });
});
