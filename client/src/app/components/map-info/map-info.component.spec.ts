import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';
import { GameMode } from '@common/enums/game-mode.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { Map } from '@common/interfaces/map';
import { MapInfoComponent } from './map-info.component';

describe('MapInfoComponent', () => {
    let component: MapInfoComponent;
    let fixture: ComponentFixture<MapInfoComponent>;
    let mapSelectionSpy: jasmine.SpyObj<MapSelectionService>;
    const MOCK_MAP_INFO: Map = {
        _id: '0',
        name: 'Mock Map 1',
        description: 'A standard description',
        size: MapSize.Small,
        mode: GameMode.Normal,
        mapArray: [],
        placedItems: [],
        isVisible: true,
        dateOfLastModification: new Date(),
        imageData: '',
    };

    beforeEach(async () => {
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['selectedMap'], {
            selectedMap: null,
        });

        await TestBed.configureTestingModule({
            imports: [MapInfoComponent],
            providers: [{ provide: MapSelectionService, useValue: mapSelectionSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(MapInfoComponent);
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

    it('a selection should display the information', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => MOCK_MAP_INFO,
        });
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#map-preview'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('#map-info'))).toBeTruthy();
    });
});
