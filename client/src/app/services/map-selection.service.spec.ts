// import { provideHttpClientTesting } from '@angular/common/http/testing';
// import { TestBed } from '@angular/core/testing';
// import { RouterLink } from '@angular/router';
// import { GameMode, generateMapArray, Item, Map, MapSize, TileTerrain } from '@app/interfaces/map';
// import { of, throwError } from 'rxjs';
// import { MEDIUM_MAP_SIZE, SMALL_MAP_SIZE } from 'src/app/constants/admin-API.constants';
// import { MapAPIService } from './map-api.service';
// import { MapSelectionService } from './map-selection.service';
// describe('MapSelectionService', () => {
//     let service: MapSelectionService;
//     let mapAPISpy: jasmine.SpyObj<MapAPIService>;
//     // let router: Router;
//     const mapsMock: Map[] = [
//         {
//             _id: '0',
//             name: 'Mock Map 1',
//             description: '',
//             size: MapSize.SMALL,
//             mode: GameMode.NORMAL,
//             placedItems: [Item.BOOST1, Item.BOOST2, Item.BOOST3],
//             mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.GRASS),
//             isVisible: true,
//             dateOfLastModification: new Date(),
//             placedItems: [],
//         },
//         {
//             _id: '1',
//             name: 'Mock Map 2',
//             description: '',
//             size: MapSize.SMALL,
//             mode: GameMode.NORMAL,
//             mapArray: generateMapArray(MEDIUM_MAP_SIZE, TileTerrain.ICE),
//             placedItems: [Item.BOOST1, Item.BOOST5, Item.BOOST6, Item.BOOST4],
//             isVisible: true,
//             dateOfLastModification: new Date(),
//             placedItems: [],
//         },
//         {
//             _id: '3',
//             name: 'Mock Map 3',
//             description: '',
//             size: MapSize.SMALL,
//             mode: GameMode.NORMAL,
//             mapArray: generateMapArray(MEDIUM_MAP_SIZE, TileTerrain.ICE),
//             placedItems: [],
//             isVisible: false,
//             dateOfLastModification: new Date(),
//             placedItems: [],
//         },
//         {
//             _id: '3',
//             name: 'Mock Map 4',
//             description: '',
//             size: MapSize.SMALL,
//             mode: GameMode.CTF,
//             mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.WATER),
//             placedItems: [Item.BOOST1, Item.BOOST2, Item.BOOST3, Item.BOOST4],
//             isVisible: false,
//             dateOfLastModification: new Date(),
//             placedItems: [],
//         },
//     ];

//     beforeEach(() => {
//         mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMaps', 'getMapbyId', 'getMapbyName', 'deleteMap', 'updateMap', 'createMap']);
//         mapAPISpy.getMaps.and.returnValue(of(mapsMock));
//         TestBed.configureTestingModule({
//             imports: [RouterLink],
//             providers: [{ provide: MapAPIService, useValue: mapAPISpy }, provideHttpClientTesting()],
//         });
//         service = TestBed.inject(MapSelectionService);
//         // router = TestBed.inject(Router);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should be loaded after initialization', () => {
//         service.initialize();
//         expect(service.loaded).toBeTrue();
//     });

//     it('should have the map list after initialization', () => {
//         service.initialize();
//         expect(service.maps).toBe(mapsMock);
//     });

//     it('should have no selection after initialization', () => {
//         service.initialize();
//         expect(service.selectedMap).toBeNull();
//     });
//     it('should return the selected map when selection', () => {
//         service.initialize();
//         service.chooseSelectedMap(0);

//         expect(service.selectedMap).toBe(mapsMock[0]);
//     });

//     it('should delete a map', () => {
//         service.initialize();
//         mapAPISpy.deleteMap.and.returnValue(of(null));
//         const oldNumbofMaps = service.maps.length;
//         const mapToDelete = mapsMock[1];
//         mapAPISpy.getMapbyId.and.returnValue(of(mapToDelete));
//         service.delete(mapToDelete).subscribe(() => {
//             expect(mapAPISpy.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
//             expect(service.maps.length).toBe(oldNumbofMaps - 1);
//             expect(service.maps.find((m) => m._id === mapToDelete._id)).toBe(undefined);
//         });
//     });

//     it('should handle error when deleting a map', () => {
//         service.initialize();
//         const errorMessage = 'Delete failed';
//         mapAPISpy.deleteMap.and.returnValue(throwError(() => new Error(errorMessage)));
//         const oldNumbofMaps = service.maps.length;
//         const mapToDelete = mapsMock[1];
//         service.delete(mapToDelete).subscribe({
//             error: (error: Error) => {
//                 expect(mapAPISpy.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
//                 expect(service.maps.length).toBe(oldNumbofMaps);
//                 expect(service.maps.find((m) => m._id === mapToDelete._id)).toBeDefined();
//                 expect(error.message).toBe(errorMessage);
//             },
//         });
//     });

//     it('should call mapAPIService.updateMap with correct map data', () => {
//         service.initialize();
//         const newMapUpdated = mapsMock[3];
//         mapAPISpy.updateMap.and.returnValue(of(void 0));
//         service.modifyMap(newMapUpdated).subscribe({
//             next: () => {
//                 expect(mapAPISpy.updateMap).toHaveBeenCalledWith(newMapUpdated);
//             },
//         });
//     });

//     it('should handle error when updating a map', () => {
//         service.initialize();
//         const errorMessage = 'Update failed';
//         const newMapUpdated = mapsMock[3];

//         mapAPISpy.updateMap.and.returnValue(throwError(() => new Error(errorMessage)));

//         service.modifyMap(newMapUpdated).subscribe({
//             error: (error) => {
//                 expect(mapAPISpy.updateMap).toHaveBeenCalledWith(newMapUpdated);
//                 expect(error.message).toBe(errorMessage);
//             },
//         });
//     });

//     it('should toggle map visibility and update map', () => {
//         service.initialize();
//         const mapToToggle = mapsMock[2];
//         const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };
//         mapAPISpy.updateMap.and.returnValue(of(void 0));

//         service.toggleVisibility(mapToToggle).subscribe(() => {
//             expect(mapAPISpy.updateMap).toHaveBeenCalledWith(updatedMap);
//             expect(service.maps.find((m) => m._id === mapToToggle._id)?.isVisible).toBe(updatedMap.isVisible);
//         });
//     });

//     it('should handle error when toggling map visibility', () => {
//         service.initialize();
//         const errorMessage = 'Toggle failed';
//         const mapToToggle = mapsMock[2];
//         const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };

//         mapAPISpy.updateMap.and.returnValue(throwError(() => new Error(errorMessage)));

//         service.toggleVisibility(mapToToggle).subscribe({
//             error: (error) => {
//                 expect(mapAPISpy.updateMap).toHaveBeenCalledWith(updatedMap);
//                 expect(service.maps.find((m) => m._id === mapToToggle._id)?.isVisible).toBe(mapToToggle.isVisible);
//                 expect(error.message).toBe(errorMessage);
//             },
//         });
//     });

//     it('should navigate to the edit route with the correct map in state', () => {
//         const searchedMap: Map = mapsMock[2];
//         const navigateSpy = spyOn(router, 'navigate');

//         // service.goToEditMap(searchedMap);

//         expect(navigateSpy).toHaveBeenCalledWith(['/edit'], { state: { map: searchedMap, isPresentInDatabase: true } });
//     });
// });
