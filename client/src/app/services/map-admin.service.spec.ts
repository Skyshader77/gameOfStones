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
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['deleteMap', 'updateMap', 'getMapById']);
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
        mapAPISpy.getMapById.and.returnValue(of(mapToDelete));
        service.deleteMap(mapToDelete._id, mapToDelete).subscribe(() => {
            expect(mapAPISpy.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
            expect(mapListSpy.deleteMapOnUI).toHaveBeenCalledWith(mapToDelete);
        });
    });

    it('should handle error when deleting a map', () => {
        const errorMessage = 'Delete failed';
        mapAPISpy.deleteMap.and.returnValue(throwError(() => new Error(errorMessage)));
        const mapToDelete = mockMaps[1];
        service.deleteMap(mapToDelete._id, mapToDelete).subscribe({
            error: (error: Error) => {
                expect(mapListSpy.deleteMapOnUI).not.toHaveBeenCalled();
                expect(error.message.toString()).toContain(errorMessage);
            },
        });
    });

    it('should toggle map visibility and update map', () => {
        const mapToToggle = mockMaps[0];
        const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };
        mapAPISpy.updateMap.and.returnValue(of(mockMaps[3]));
        service.toggleVisibilityMap(mapToToggle).subscribe(() => {
            expect(mapAPISpy.updateMap).toHaveBeenCalledWith(updatedMap);
            expect(mapListSpy.updateMapOnUI).toHaveBeenCalledOnceWith(updatedMap);
        });
    });

    it('should handle error when toggling map visibility', () => {
        const errorMessage = 'Toggle failed';
        const mapToToggle = mockMaps[0];
        mapAPISpy.updateMap.and.returnValue(throwError(() => new Error(errorMessage)));
        service.toggleVisibilityMap(mapToToggle).subscribe({
            error: (error: Error) => {
                expect(mapListSpy.updateMapOnUI).not.toHaveBeenCalled();
                expect(error.message.toString()).toContain(errorMessage);
            },
        });
    });

    it('should navigate to the edit route with the correct map in state', () => {
        const searchedMap: Map = mockMaps[0];
        const navigateSpy = spyOn(router, 'navigate');
        mapAPISpy.getMapById.and.returnValue(of(searchedMap));
        service.editMap(searchedMap);
        service.editMap(searchedMap).subscribe(() => {
            expect(navigateSpy).toHaveBeenCalledWith(['/edit', searchedMap._id]);
        });
    });

    it('should handle error when the map does not exist anymore', () => {
        const searchedMap: Map = mockMaps[0];
        const navigateSpy = spyOn(router, 'navigate');
        const errorMessage = 'Edit failed';
        mapAPISpy.getMapById.and.returnValue(throwError(() => new Error(errorMessage)));
        service.editMap(searchedMap);
        expect(mapAPISpy.getMapById).toHaveBeenCalledWith(searchedMap._id);
        service.editMap(searchedMap).subscribe({
            error: (error: Error) => {
                expect(navigateSpy).not.toHaveBeenCalledWith(['/edit', searchedMap._id]);
                expect(error.message.toString()).toContain(errorMessage);
            },
        });
    });
});
