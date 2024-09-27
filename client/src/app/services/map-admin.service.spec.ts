import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, RouterLink } from '@angular/router';
import { mockMaps } from '@app/constants/tests.constants';
import { Map } from '@app/interfaces/map';
import { of, throwError } from 'rxjs';
import { MapAdminService } from './map-admin.service';
import { MapAPIService } from './map-api.service';
import { MapListService } from './map-list.service';
describe('MapAdminService', () => {
    let service: MapAdminService;
    let mapAPISpy: jasmine.SpyObj<MapAPIService>;
    let mapListSpy: jasmine.SpyObj<MapListService>;
    let router: Router;

    beforeEach(() => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['deleteMap', 'updateMap', 'getMapbyId']);
        mapListSpy = jasmine.createSpyObj('MapListService', ['getMapsAPI', 'deleteMapOnUI', 'updateMapOnUI'], { maps: mockMaps });
        TestBed.configureTestingModule({
            imports: [RouterLink],
            providers: [
                { provide: MapAPIService, useValue: mapAPISpy },
                { provide: MapListService, useValue: mapListSpy },
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(MapAdminService);
        router = TestBed.inject(Router);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should delete a map', () => {
        const mapToDelete = mockMaps[1];
        mapAPISpy.deleteMap.and.returnValue(of({ id: mapToDelete._id }));
        mapAPISpy.getMapbyId.and.returnValue(of(mapToDelete));
        service.delete(mapToDelete._id, mapToDelete).subscribe(() => {
            expect(mapAPISpy.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
            expect(mapListSpy.deleteMapOnUI).toHaveBeenCalledWith(mapToDelete);
        });
    });

    it('should handle error when deleting a map', () => {
        const errorMessage = 'Delete failed';
        mapAPISpy.deleteMap.and.returnValue(throwError(() => new Error(errorMessage)));
        const mapToDelete = mockMaps[1];
        service.delete(mapToDelete._id, mapToDelete).subscribe({
            error: (error: Error) => {
                expect(mapListSpy.deleteMapOnUI).not.toHaveBeenCalled();
                expect(error.message).toBe(errorMessage);
            },
        });
    });

    it('should call mapAPIService.updateMap with correct map data', () => {
        const newMapUpdated = mockMaps[3];
        mapAPISpy.updateMap.and.returnValue(of(mockMaps[3]));
        service.modifyMap(newMapUpdated).subscribe({
            next: () => {
                expect(mapAPISpy.updateMap).toHaveBeenCalledWith(newMapUpdated);
                expect(mapListSpy.updateMapOnUI).toHaveBeenCalledOnceWith(newMapUpdated);
            },
        });
    });

    it('should handle error when updating a map', () => {
        const errorMessage = 'Update failed';
        const newMapUpdated = mockMaps[3];

        mapAPISpy.updateMap.and.returnValue(throwError(() => new Error(errorMessage)));

        service.modifyMap(newMapUpdated).subscribe({
            error: (error) => {
                expect(mapListSpy.updateMapOnUI).not.toHaveBeenCalled();
                expect(error.message).toBe(errorMessage);
            },
        });
    });

    it('should toggle map visibility and update map', () => {
        const mapToToggle = mockMaps[2];
        const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };
        mapAPISpy.updateMap.and.returnValue(of(mockMaps[3]));

        service.toggleVisibility(mapToToggle).subscribe(() => {
            expect(mapAPISpy.updateMap).toHaveBeenCalledWith(updatedMap);
            expect(mapListSpy.updateMapOnUI).toHaveBeenCalledOnceWith(updatedMap);
        });
    });

    it('should handle error when toggling map visibility', () => {
        const errorMessage = 'Toggle failed';
        const mapToToggle = mockMaps[2];

        mapAPISpy.updateMap.and.returnValue(throwError(() => new Error(errorMessage)));

        service.toggleVisibility(mapToToggle).subscribe({
            error: (error) => {
                expect(mapListSpy.updateMapOnUI).not.toHaveBeenCalled();
                expect(error.message).toBe(errorMessage);
            },
        });
    });

    it('should navigate to the edit route with the correct map in state', () => {
        const searchedMap: Map = mockMaps[2];
        const navigateSpy = spyOn(router, 'navigate');

        service.goToEditMap(searchedMap);

        expect(navigateSpy).toHaveBeenCalledWith(['/edit'], { state: { map: searchedMap, isPresentInDatabase: true } });
    });
});
