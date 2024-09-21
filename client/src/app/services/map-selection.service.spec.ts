import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, RouterLink } from '@angular/router';
import { GameMode, Map, MapSize } from '@app/interfaces/map';
import { of, throwError } from 'rxjs';
import { MapAPIService } from './map-api.service';
import { MapSelectionService } from './map-selection.service';
describe('MapSelectionService', () => {
    let service: MapSelectionService;
    let mapAPISpy: jasmine.SpyObj<MapAPIService>;
    let router: Router;
    const mapsMock: Map[] = [
        {
            _id: '0',
            name: 'Mock Map 1',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            placedItems: [],
            mapArray: [],
            isVisible: true,
            dateOfLastModification: new Date(),
        },
        {
            _id: '1',
            name: 'Mock Map 2',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: [],
            placedItems: [],
            isVisible: true,
            dateOfLastModification: new Date(),
        },
        {
            _id: '3',
            name: 'Mock Map 3',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: [],
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
            mapArray: [],
            placedItems: [],
            isVisible: false,
            dateOfLastModification: new Date(),
        },
    ];

    beforeEach(() => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMaps', 'getMapbyId', 'getMapbyName', 'deleteMap', 'updateMap']);
        mapAPISpy.getMaps.and.returnValue(of(mapsMock));
        TestBed.configureTestingModule({
            imports: [RouterLink],
            providers: [{ provide: MapAPIService, useValue: mapAPISpy }, provideHttpClientTesting()],
        });
        service = TestBed.inject(MapSelectionService);
        router = TestBed.inject(Router);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be loaded after initialization', () => {
        service.initialize();
        expect(service.loaded).toBeTrue();
    });

    it('should be not hovered after initialization', () => {
        service.initialize();
        expect(service.isHover).toBe(false);
    });

    it('should have the map list after initialization', () => {
        service.initialize();
        expect(service.maps).toBe(mapsMock);
    });

    it('should have no selection after initialization', () => {
        service.initialize();
        expect(service.selectedMap).toBeNull();
    });
    it('should set the hover state', () => {
        service.initialize();
        service.onHover(true);
        expect(service.isHover).toBe(true);
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
        mapAPISpy.getMapbyId.and.returnValue(of(mapToDelete));
        service.delete(mapToDelete).subscribe(() => {
            expect(mapAPISpy.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
            expect(service.maps.length).toBe(oldNumbofMaps - 1);
            expect(service.maps.find((m) => m._id === mapToDelete._id)).toBe(undefined);
        });
    });

    it('should handle error when deleting a map', () => {
        service.initialize();
        const errorMessage = 'Delete failed';
        mapAPISpy.deleteMap.and.returnValue(throwError(() => new Error(errorMessage)));
        const oldNumbofMaps = service.maps.length;
        const mapToDelete = mapsMock[1];
        mapAPISpy.getMapbyId.and.returnValue(of(mapToDelete));
        service.delete(mapToDelete).subscribe({
            error: (error: Error) => {
                expect(mapAPISpy.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
                expect(service.maps.length).toBe(oldNumbofMaps);
                expect(service.maps.find((m) => m._id === mapToDelete._id)).toBeDefined();
                expect(error.message).toBe(errorMessage);
            },
        });
    });

    it('should handle case where map was already deleted', (done) => {
        service.initialize();
        const errorMessage = 'Error 404: Cette carte a déjà été supprimée. Veuillez rafraîchir votre écran.';
        const oldNumbofMaps = service.maps.length;
        const mapToDelete = mapsMock[1];

        mapAPISpy.getMapbyId.and.returnValue(throwError(() => new Error(errorMessage)));

        service.delete(mapToDelete).subscribe({
            error: (err) => {
                expect(err.message).toBe('Cette carte a déjà été supprimée par un autre individu. Veuillez rafraîchir votre écran.');
                expect(service.maps.length).toBe(oldNumbofMaps);
                expect(service.maps.find((m) => m._id === mapToDelete._id)).toBeDefined();
                done();
            },
        });
    });

    it('should call mapAPIService.updateMap with correct map data', () => {
        service.initialize();
        const mapToUpdate = mapsMock[2];
        const newMapUpdated = mapsMock[3];
        mapAPISpy.updateMap.and.returnValue(of(newMapUpdated));
        service.modifyMap(newMapUpdated).subscribe({
            next: () => {
                expect(mapAPISpy.updateMap).toHaveBeenCalledWith(mapToUpdate._id, newMapUpdated);
            },
        });
    });

    it('should handle error when updating a map', () => {
        service.initialize();
        const errorMessage = 'Update failed';
        const mapToUpdate = mapsMock[2];
        const newMapUpdated = mapsMock[3];

        mapAPISpy.updateMap.and.returnValue(throwError(() => new Error(errorMessage)));

        service.modifyMap(newMapUpdated).subscribe({
            error: (error) => {
                expect(mapAPISpy.updateMap).toHaveBeenCalledWith(mapToUpdate._id, newMapUpdated);
                expect(error.message).toBe(errorMessage);
            },
        });
    });

    it('should toggle map visibility and update map', () => {
        service.initialize();
        const mapToToggle = mapsMock[2];
        const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };
        mapAPISpy.updateMap.and.returnValue(of(updatedMap));

        service.toggleVisibility(mapToToggle).subscribe(() => {
            expect(mapAPISpy.updateMap).toHaveBeenCalledWith(mapToToggle._id, updatedMap);
            expect(service.maps.find((m) => m._id === mapToToggle._id)?.isVisible).toBe(updatedMap.isVisible);
        });
    });

    it('should handle error when toggling map visibility', () => {
        service.initialize();
        const errorMessage = 'Toggle failed';
        const mapToToggle = mapsMock[2];
        const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };

        mapAPISpy.updateMap.and.returnValue(throwError(() => new Error(errorMessage)));

        service.toggleVisibility(mapToToggle).subscribe({
            error: (error) => {
                expect(mapAPISpy.updateMap).toHaveBeenCalledWith(mapToToggle._id, updatedMap);
                expect(service.maps.find((m) => m._id === mapToToggle._id)?.isVisible).toBe(mapToToggle.isVisible);
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
