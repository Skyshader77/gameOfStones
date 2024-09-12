import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { GameMode, Item, Map, Tile, TileTerrain, newMap } from '../interfaces/map';
import { MapAPIService } from './map-api.service';
import { MEDIUM_MAP_SIZE, SMALL_MAP_SIZE } from './services.constants';

describe('MapAPIService', () => {
  let httpMock: HttpTestingController;
  let service: MapAPIService;
  let baseUrl: string;
  let mockMaps: Map[];
  let mockNewMap: newMap;
  beforeEach(() => {
      TestBed.configureTestingModule({
          imports: [],
          providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
      });
      service = TestBed.inject(MapAPIService );
      httpMock = TestBed.inject(HttpTestingController);
      // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the tet
      baseUrl =  environment.serverUrl;
  });

  mockMaps = [
      { mapId: "Su27FLanker", name: 'Game of Drones', mapDescription: 'Test Map 1', rowSize:10, mode:GameMode.NORMAL, dateOfLastModification:new Date('December 17, 1995 03:24:00'), mapArray:generateGrassMapArray(), isVIsible:true },
      { mapId: "F35jsf", name: 'Engineers of War', mapDescription: 'Test Map 2', rowSize:15, mode:GameMode.CTF, dateOfLastModification:new Date('December 17, 1997 03:24:00'), mapArray:generateIceMapArray(), isVIsible:true },
      { mapId: "Su27FLanker", name: 'Game of Thrones', mapDescription: 'Test Map 2.5', rowSize:10, mode:GameMode.CTF, dateOfLastModification:new Date('December 17, 1998 03:24:00'), mapArray:generateGrassMapArray(), isVIsible:false },
  ];

  mockNewMap = { name: 'NewMapTest', mapDescription: 'Test Map 3', rowSize:10, mode:GameMode.NORMAL, mapArray:generateGrassMapArray()};

  afterEach(() => {
    httpMock.verify(); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all maps (getMaps)', () => {
    service.getMaps().subscribe((maps) => {
      expect(maps.length).toBe(3);
      expect(maps).toEqual(mockMaps);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockMaps); 
  });

  it('should retrieve a map by ID (getMapbyId)', () => {
    const mapId = "Su27FLanker";
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
    const newMap: newMap = mockNewMap;

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

    service.updateMap(oldMap.mapId, updatedMap).subscribe((map) => {
      expect(map).toEqual(updatedMap);
    });

    const req = httpMock.expectOne(`${baseUrl}/${updatedMap.mapId}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(updatedMap); 
  });

  it('should delete a map (deleteMap)', () => {
    const mapId = "Su27FLanker";

    service.deleteMap(mapId).subscribe((response) => {
      expect(response).toBeNull(); 
    });

    const req = httpMock.expectOne(`${baseUrl}/${mapId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null); 
  });
});

function generateGrassMapArray(): Tile[] {
  const mapArray: Tile[] = [];

  for (let i = 0; i < SMALL_MAP_SIZE * SMALL_MAP_SIZE; i++) {
    const tile: Tile = {
      terrain: TileTerrain.GRASS,
      item: Item.NONE,
    };
    mapArray.push(tile);
  }

  return mapArray;
}

function generateIceMapArray(): Tile[] {
  const mapArray: Tile[] = [];

  for (let i = 0; i < MEDIUM_MAP_SIZE * MEDIUM_MAP_SIZE; i++) {
    const tile: Tile = {
      terrain: TileTerrain.ICE,
      item: Item.NONE, 
    };
    mapArray.push(tile);
  }

  return mapArray;
}