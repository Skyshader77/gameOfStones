import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GameMode, Map, MapSize } from '@app/interfaces/map';
import { MapSelectionService } from '@app/services/map-selection.service';
import { MapDescriptionBoxComponent } from './map-description-box.component';

describe('MapInfoComponent', () => {
    let component: MapDescriptionBoxComponent;
    let fixture: ComponentFixture<MapDescriptionBoxComponent>;
    let mapSelectionSpy: jasmine.SpyObj<MapSelectionService>;
    const mockMap: Map = {
        _id: '0',
        name: 'Mock Map 1',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: [],
        placedItems: [],
        isVisible: true,
        dateOfLastModification: new Date(),
    };

    beforeEach(async () => {
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['selectedMap'], {
            selectedMap: null,
        });

        await TestBed.configureTestingModule({
            imports: [MapDescriptionBoxComponent],
            providers: [{ provide: MapSelectionService, useValue: mapSelectionSpy }],
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

    it('a selection should display the information on the Admin Page when someone hovers over the image', () => {
        component.isHover = true;
        Object.defineProperties(mapSelectionSpy, {
            selectedMap: { get: () => mockMap },
            isHover: { get: () => true },
        });
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#map-info'))).toBeTruthy();
    });
});
