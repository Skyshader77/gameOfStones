import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { of } from 'rxjs';
import { SMALL_MAP_SIZE } from 'src/app/constants/admin-API.constants';
import { GameMode, Map, TileTerrain, generateMapArray } from 'src/app/interfaces/map';
import { MapAPIService } from 'src/app/services/map-api.service';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let mapAPIService: jasmine.SpyObj<MapAPIService>;
    const routes: Routes = [];
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

    beforeEach(async () => {
        const mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMaps', 'deleteMap', 'updateMap']);
        await TestBed.configureTestingModule({
            imports: [AdminPageComponent, FontAwesomeModule],
            providers: [{ provide: MapAPIService, useValue: mapAPISpy }, provideHttpClientTesting(), provideRouter(routes)],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        mapAPIService = TestBed.inject(MapAPIService) as jasmine.SpyObj<MapAPIService>;
        mapAPIService.getMaps.and.returnValue(of(mockMaps));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getMaps on init and populate the maps', () => {
        expect(mapAPIService.getMaps).toHaveBeenCalled();
        expect(component.maps.length).toBe(mockMaps.length);
    });

    it('should delete a map', () => {
        mapAPIService.deleteMap.and.returnValue(of(null));

        const mapToDelete = mockMaps[0];
        component.delete(mapToDelete);

        expect(mapAPIService.deleteMap).toHaveBeenCalledWith(mapToDelete._id);
        expect(component.maps.length).toBe(mockMaps.length - 1);
        expect(component.maps).not.toContain(mapToDelete);
    });

    it('should select a map when selectMap is called', () => {
        const mapToSelect = mockMaps[0];
        component.selectMap(mapToSelect);

        expect(component.selectedMap).toBe(mapToSelect);
    });

    it('should toggle map visibility', () => {
        const mapToToggle = mockMaps[0];
        const updatedMap = { ...mapToToggle, isVisible: false };
        mapAPIService.updateMap.and.returnValue(of(updatedMap));

        component.toggleVisibility(mapToToggle);

        expect(mapAPIService.updateMap).toHaveBeenCalledWith(mapToToggle._id, updatedMap);
        expect(component.maps[0].isVisible).toBe(false);
    });
});
