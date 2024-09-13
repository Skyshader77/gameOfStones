import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SMALL_MAP_SIZE } from 'src/app/constants/admin-API.constants';
import { GameMode, generateMapArray, Map, MapCreate, TileTerrain } from 'src/app/interfaces/map';
import { environment } from 'src/environments/environment';
import { MapAPIService } from './map-api.service';

describe('MapAPIService', () => {
    let httpMock: HttpTestingController;
    let service: MapAPIService;
    let baseUrl: string;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        service = TestBed.inject(MapAPIService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the tet
        baseUrl = `${environment.serverUrl}api/Map`;
    });

    const mockMaps: Map[] = [
        {
            _id: 'Su27FLanker',
            name: 'Game of Drones',
            mapDescription: 'Test Map 1',
            sizeRow: 10,
            mode: GameMode.NORMAL,
            dateOfLastModification: new Date('December 17, 1995 03:24:00'),
            mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.GRASS),
            isVisible: true,
        },
        {
            _id: 'F35jsf',
            name: 'Engineers of War',
            mapDescription: 'Test Map 2',
            sizeRow: 15,
            mode: GameMode.CTF,
            dateOfLastModification: new Date('December 17, 1997 03:24:00'),
            mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.GRASS),
            isVisible: true,
        },
        {
            _id: 'Su27FLanker',
            name: 'Game of Thrones',
            mapDescription: 'Test Map 2.5',
            sizeRow: 10,
            mode: GameMode.CTF,
            dateOfLastModification: new Date('December 17, 1998 03:24:00'),
            mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.GRASS),
            isVisible: false,
        },
    ];
    const mockNewMap: MapCreate = {
        name: 'NewMapTest',
        mapDescription: 'Test Map 3',
        sizeRow: 10,
        mode: GameMode.NORMAL,
        mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.WATER),
    };

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve all maps (getMaps)', () => {
        service.getMaps().subscribe((maps) => {
            expect(maps.length).toBe(mockMaps.length);
            expect(maps).toEqual(mockMaps);
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockMaps);
    });

    it('should retrieve a map by ID (getMapbyId)', () => {
        const mapId = 'Su27FLanker';
        service.getMapbyId(mapId).subscribe((map) => {
            expect(map).toEqual(mockMaps[0]);
        });

        const req = httpMock.expectOne(`${baseUrl}/${mapId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMaps[0]);
    });

    it('should retrieve a map by name (getMapbyName)', () => {
        const mapName = 'Game of Drones';
        service.getMapbyName(mapName).subscribe((map) => {
            expect(map).toEqual(mockMaps[0]);
        });

        const req = httpMock.expectOne(`${baseUrl}/name/${mapName}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockMaps[0]);
    });

    it('should create a new map (createMap)', () => {
        const newMap: MapCreate = mockNewMap;

        service.createMap(newMap).subscribe((map) => {
            expect(map).toEqual(newMap);
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
        req.flush(newMap);
    });

    it('should update an existing map (updateMap)', () => {
        const oldMap: Map = mockMaps[0];
        const updatedMap: Map = mockMaps[2];

        service.updateMap(oldMap._id, updatedMap).subscribe((map) => {
            expect(map).toEqual(updatedMap);
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('PATCH');
        req.flush(updatedMap);
    });

    it('should delete a map (deleteMap)', () => {
        const mapId = 'Su27FLanker';

        service.deleteMap(mapId).subscribe((response) => {
            expect(response).toBeNull();
        });

        const req = httpMock.expectOne(`${baseUrl}/${mapId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
