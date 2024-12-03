import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MODE_DESCRIPTIONS, UNKNOWN_TEXT } from '@app/constants/conversion.constants';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection/map-selection.service';
import { MODE_NAMES } from '@common/constants/game-map.constants';
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
        imageData: 'mock-image-data',
    };

    beforeEach(async () => {
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', [], {
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

    it('should return false for hasSelection if no map is selected', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => null,
        });
        fixture.detectChanges();
        expect(component.hasSelection).toBeFalse();
    });

    it('should return true for hasSelection if a map is selected', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => MOCK_MAP_INFO,
        });
        fixture.detectChanges();
        expect(component.hasSelection).toBeTrue();
    });

    it('should return imageData of selected map', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => MOCK_MAP_INFO,
        });
        fixture.detectChanges();
        expect(component.imageData).toBe(MOCK_MAP_INFO.imageData);
    });

    it('should return mapName of selected map', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => MOCK_MAP_INFO,
        });
        fixture.detectChanges();
        expect(component.mapName).toBe(MOCK_MAP_INFO.name);
    });

    it('should return mapDescription of selected map', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => MOCK_MAP_INFO,
        });
        fixture.detectChanges();
        expect(component.mapDescription).toBe(MOCK_MAP_INFO.description);
    });

    it('should return mapSize of selected map', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => MOCK_MAP_INFO,
        });
        fixture.detectChanges();
        expect(component.mapSize).toBe(MOCK_MAP_INFO.size);
    });

    it('should return "Inconnu" for mapMode if no map is selected', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => null,
        });
        fixture.detectChanges();
        expect(component.mapMode).toBe('Inconnu');
    });

    it('should return the correct mapMode from MODE_NAMES if map is selected', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => MOCK_MAP_INFO,
        });
        fixture.detectChanges();
        const expectedMode = MODE_NAMES[MOCK_MAP_INFO.mode];
        expect(component.mapMode).toBe(expectedMode);
    });

    it('should return the correct description for a known mode', () => {
        const expectedDescription = MODE_DESCRIPTIONS['Classique'];
        expect(component.getModeDescription('Classique')).toBe(expectedDescription);
    });

    it('should return "Inconnu" for an unknown mode', () => {
        const unknownMode = 'UnknownMode' as unknown as string;
        expect(component.getModeDescription(unknownMode)).toBe(UNKNOWN_TEXT);
    });
});
