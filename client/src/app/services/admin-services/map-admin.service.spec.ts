import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, RouterLink } from '@angular/router';
import { MOCK_MAPS } from '@app/constants/tests.constants';
import { Map } from '@app/interfaces/map';
import { of, throwError } from 'rxjs';
import { MapAdminService } from './map-admin.service';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list.service';
import { ErrorMessageService } from '@app/services/utilitary/error-message.service';

describe('MapAdminService', () => {
    let service: MapAdminService;
    let mapAPISpy: jasmine.SpyObj<MapAPIService>;
    let mapListSpy: jasmine.SpyObj<MapListService>;
    let errorMessageSpy: jasmine.SpyObj<ErrorMessageService>;
    let router: Router;

    beforeEach(() => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['deleteMap', 'updateMap', 'getMapById']);
        mapListSpy = jasmine.createSpyObj('MapListService', ['getMapsAPI', 'deleteMapOnUI', 'updateMapOnUI'], { maps: MOCK_MAPS });
        errorMessageSpy = jasmine.createSpyObj('ErrorMessageService', ['showMessage']);
        TestBed.configureTestingModule({
            imports: [RouterLink],
            providers: [
                { provide: MapAPIService, useValue: mapAPISpy },
                { provide: MapListService, useValue: mapListSpy },
                { provide: ErrorMessageService, useValue: errorMessageSpy },
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
        const mapToDelete = MOCK_MAPS[1];
        mapAPISpy.deleteMap.and.returnValue(of({ id: mapToDelete._id }));
        mapAPISpy.getMapById.and.returnValue(of(mapToDelete));
        service.deleteMap(mapToDelete._id, mapToDelete);
        expect(mapAPISpy.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
        expect(mapListSpy.deleteMapOnUI).toHaveBeenCalledWith(mapToDelete);
    });

    it('should handle error when deleting a map', () => {
        const errorMessage = 'Delete failed';
        mapAPISpy.deleteMap.and.returnValue(throwError(() => new Error(errorMessage)));
        const mapToDelete = MOCK_MAPS[1];
        service.deleteMap(mapToDelete._id, mapToDelete);
        // TODO
        expect(errorMessageSpy.showMessage).toHaveBeenCalled();
    });

    it('should toggle map visibility and update map', () => {
        const mapToToggle = MOCK_MAPS[0];
        const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };
        mapAPISpy.updateMap.and.returnValue(of(MOCK_MAPS[3]));
        service.toggleVisibilityMap(mapToToggle);
        expect(mapAPISpy.updateMap).toHaveBeenCalledWith(updatedMap);
        expect(mapListSpy.updateMapOnUI).toHaveBeenCalledOnceWith(updatedMap);
    });

    it('should handle error when toggling map visibility', () => {
        const errorMessage = 'Toggle failed';
        const mapToToggle = MOCK_MAPS[0];
        mapAPISpy.updateMap.and.returnValue(throwError(() => new Error(errorMessage)));
        service.toggleVisibilityMap(mapToToggle);
        // TODO
        expect(errorMessageSpy.showMessage).toHaveBeenCalled();
    });

    it('should navigate to the edit route with the correct map in state', () => {
        const searchedMap: Map = MOCK_MAPS[0];
        const navigateSpy = spyOn(router, 'navigate');
        mapAPISpy.getMapById.and.returnValue(of(searchedMap));
        service.editMap(searchedMap);

        expect(navigateSpy).toHaveBeenCalledWith(['/edit', searchedMap._id]);
    });

    it('should handle error when the map does not exist anymore', () => {
        const searchedMap: Map = MOCK_MAPS[0];
        const errorMessage = 'Edit failed';
        mapAPISpy.getMapById.and.returnValue(throwError(() => new Error(errorMessage)));
        service.editMap(searchedMap);
        expect(mapAPISpy.getMapById).toHaveBeenCalledWith(searchedMap._id);
        service.editMap(searchedMap);
        expect(errorMessageSpy.showMessage).toHaveBeenCalled();
    });
});
