import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MOCK_MAPS, MOCK_NEW_MAP } from '@app/constants/tests.constants';
import { MapListService } from '@app/services/map-list-managing-services/map-list.service';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';
import { MapDescriptionBoxComponent } from './map-description-box.component';
describe('MapDescriptionBoxComponent', () => {
    let component: MapDescriptionBoxComponent;
    let fixture: ComponentFixture<MapDescriptionBoxComponent>;
    let mapSelectionSpy: jasmine.SpyObj<MapSelectionService>;
    let mapListSpy: jasmine.SpyObj<MapListService>;
    const mockMap = MOCK_NEW_MAP;
    beforeEach(async () => {
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['selectedMap'], {
            selectedMap: null,
        });
        mapListSpy = jasmine.createSpyObj('MapListService', {
            maps: MOCK_MAPS,
        });
        await TestBed.configureTestingModule({
            imports: [MapDescriptionBoxComponent],
            providers: [
                { provide: MapSelectionService, useValue: mapSelectionSpy },
                { provide: MapListService, useValue: mapListSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MapDescriptionBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('an empty selection should display a message', () => {
        expect(fixture.debugElement.query(By.css('#map-preview'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('#map-info'))).toBeFalsy();
    });

    it('a selection should display the information on the Admin Page when someone selects a map', () => {
        Object.defineProperties(mapSelectionSpy, {
            selectedMap: { get: () => mockMap },
        });
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#mapPreview'))).toBeTruthy();
    });
});
