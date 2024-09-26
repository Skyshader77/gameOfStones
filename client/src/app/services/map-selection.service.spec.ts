import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterLink } from '@angular/router';
import { GameMode, Map, MapSize } from '@app/interfaces/map';
import { of } from 'rxjs';
import { MapAPIService } from './map-api.service';
import { MapSelectionService } from './map-selection.service';

describe('MapSelectionService', () => {
    let service: MapSelectionService;
    let mapAPISpy: jasmine.SpyObj<MapAPIService>;
    // let router: Router;
    const mapsMock: Map[] = [
        {
            _id: '0',
            name: 'Mock Map 1',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: [],
            isVisible: true,
            dateOfLastModification: new Date(),
            placedItems: [],
        },
        {
            _id: '1',
            name: 'Mock Map 2',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: [],
            isVisible: true,
            dateOfLastModification: new Date(),
            placedItems: [],
        },
        {
            _id: '3',
            name: 'Mock Map 3',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: [],
            isVisible: false,
            dateOfLastModification: new Date(),
            placedItems: [],
        },
        {
            _id: '3',
            name: 'Mock Map 4',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.CTF,
            mapArray: [],
            isVisible: false,
            dateOfLastModification: new Date(),
            placedItems: [],
        },
    ];

    beforeEach(() => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMaps', 'getMapbyId', 'deleteMap', 'updateMap']);
        mapAPISpy.getMaps.and.returnValue(of(mapsMock));
        TestBed.configureTestingModule({
            imports: [RouterLink],
            providers: [{ provide: MapAPIService, useValue: mapAPISpy }, provideHttpClientTesting()],
        });
        service = TestBed.inject(MapSelectionService);
        // router = TestBed.inject(Router);
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

    it('should delete a map', () => {
        service.initialize();
        mapAPISpy.deleteMap.and.returnValue(of(null));
        const oldNumbofMaps = service.maps.length;
        const mapToDelete = mapsMock[1];
        service.delete(mapToDelete);

        expect(mapAPISpy.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
        expect(service.maps.length).toBe(oldNumbofMaps - 1);
        expect(service.maps.find((m) => m._id === mapToDelete._id)).toBe(undefined);
    });

    it('should call mapAPIService.updateMap with correct map data', () => {
        service.initialize();
        const mapToUpdate = mapsMock[2];
        const newMapUpdated = mapsMock[3];
        mapAPISpy.updateMap.and.returnValue(of(newMapUpdated));

        service.modifyMap(newMapUpdated);

        expect(mapAPISpy.updateMap).toHaveBeenCalledWith(mapToUpdate._id, newMapUpdated);
    });

    it('should toggle map visibility and update map', () => {
        service.initialize();
        const mapToToggle = mapsMock[2];
        const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };
        mapAPISpy.updateMap.and.returnValue(of(updatedMap));

        service.toggleVisibility(mapToToggle);

        expect(mapAPISpy.updateMap).toHaveBeenCalledWith(mapToToggle._id, updatedMap);
        expect(service.maps.find((m) => m._id === mapToToggle._id)?.isVisible).toBe(updatedMap.isVisible);
    });

    // it('should navigate to the edit route with the correct map in state', () => {
    // const searchedMap: Map = mapsMock[2];
    // const navigateSpy = spyOn(router, 'navigate');

    // service.goToEditMap(searchedMap);

    // expect(navigateSpy).toHaveBeenCalledWith(['/edit'], { state: searchedMap });
    // });
});
