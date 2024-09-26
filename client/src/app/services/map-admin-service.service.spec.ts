import { TestBed } from '@angular/core/testing';
import { Router} from '@angular/router';
import { MapAdminService } from './map-admin-service.service';
import { MapAPIService } from './map-api.service';
import { MapListService } from './map-list.service';
import { GameMode, generateMapArray, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
import { of, throwError } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
describe('MapAdminServiceService', () => {
  let service: MapAdminService;
  let mapAPISpy: jasmine.SpyObj<MapAPIService>;
  let mapListSpy: jasmine.SpyObj<MapListService>;
  let router: Router;

  const mapsMock: Map[] = [
    {
        _id: '0',
        name: 'Mock Map 1',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        placedItems: [Item.BOOST1, Item.BOOST2, Item.BOOST3],
        mapArray: generateMapArray(MapSize.SMALL, TileTerrain.GRASS),
        isVisible: true,
        dateOfLastModification: new Date(),
    },
    {
        _id: '1',
        name: 'Mock Map 2',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: generateMapArray(MapSize.MEDIUM, TileTerrain.ICE),
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
        mapArray: generateMapArray(MapSize.MEDIUM, TileTerrain.ICE),
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
        mapArray: generateMapArray(MapSize.SMALL, TileTerrain.WATER),
        placedItems: [Item.BOOST1, Item.BOOST2, Item.BOOST3, Item.BOOST4],
        isVisible: false,
        dateOfLastModification: new Date(),
    },
];
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClientTesting()]});
    mapListSpy = jasmine.createSpyObj('MapListService', ['getMapsAPI']);
    service = TestBed.inject(MapAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should delete a map', () => {
    mapAPISpy.deleteMap.and.returnValue(of({id:"test"}));
    const mapToDelete = mapsMock[1];
    mapAPISpy.getMapbyId.and.returnValue(of(mapToDelete));
    service.delete(mapToDelete).subscribe(() => {
        expect(mapAPISpy.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
        expect(mapListSpy.getMapsAPI).toHaveBeenCalled();
    });
});

it('should handle error when deleting a map', () => {
    const errorMessage = 'Delete failed';
    mapAPISpy.deleteMap.and.returnValue(throwError(() => new Error(errorMessage)));
    const mapToDelete = mapsMock[1];
    service.delete(mapToDelete).subscribe({
        error: (error: Error) => {
            expect(mapAPISpy.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
            expect(error.message).toBe(errorMessage);
        },
    });
});

it('should call mapAPIService.updateMap with correct map data', () => {
    const newMapUpdated = mapsMock[3];
    mapAPISpy.updateMap.and.returnValue(of(mapsMock[3]));
    service.modifyMap(newMapUpdated).subscribe({
        next: () => {
            expect(mapAPISpy.updateMap).toHaveBeenCalledWith(newMapUpdated);
            expect(mapListSpy.getMapsAPI).toHaveBeenCalled();
        },
    });
});

it('should handle error when updating a map', () => {
    const errorMessage = 'Update failed';
    const newMapUpdated = mapsMock[3];

    mapAPISpy.updateMap.and.returnValue(throwError(() => new Error(errorMessage)));

    service.modifyMap(newMapUpdated).subscribe({
        error: (error) => {
            expect(mapAPISpy.updateMap).toHaveBeenCalledWith(newMapUpdated);
            expect(error.message).toBe(errorMessage);
        },
    });
});

it('should toggle map visibility and update map', () => {
    const mapToToggle = mapsMock[2];
    const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };
    mapAPISpy.updateMap.and.returnValue(of(mapsMock[3]));

    service.toggleVisibility(mapToToggle).subscribe(() => {
        expect(mapAPISpy.updateMap).toHaveBeenCalledWith(updatedMap);
        expect(mapListSpy.getMapsAPI).toHaveBeenCalled();
    });
});

it('should handle error when toggling map visibility', () => {
    const errorMessage = 'Toggle failed';
    const mapToToggle = mapsMock[2];
    const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };

    mapAPISpy.updateMap.and.returnValue(throwError(() => new Error(errorMessage)));

    service.toggleVisibility(mapToToggle).subscribe({
        error: (error) => {
            expect(mapAPISpy.updateMap).toHaveBeenCalledWith(updatedMap);
            expect(error.message).toBe(errorMessage);
        },
    });
});

it('should navigate to the edit route with the correct map in state', () => {
    const searchedMap: Map = mapsMock[2];
    const navigateSpy = spyOn(router, 'navigate');

    service.goToEditMap(searchedMap);

    expect(navigateSpy).toHaveBeenCalledWith(['/edit'], { state: { map: searchedMap, isPresentInDatabase: true } });
});
});
