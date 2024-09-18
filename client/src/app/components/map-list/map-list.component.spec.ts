import { ComponentFixture, TestBed } from '@angular/core/testing';
import SpyObj = jasmine.SpyObj;

import { By } from '@angular/platform-browser';
import { GameMode } from '@app/interfaces/map';
import { MapSelectionService } from '@app/services/map-selection.service';
import { MapListComponent } from './map-list.component';

describe('MapListComponent', () => {
    let component: MapListComponent;
    let fixture: ComponentFixture<MapListComponent>;
    let mapSelectionSpy: SpyObj<MapSelectionService>;

    beforeEach(async () => {
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['chooseSelectedMap'], {
            maps: [
                {
                    _id: '0',
                    name: 'Mock Map 1',
                    mapDescription: '',
                    sizeRow: 0,
                    mode: GameMode.NORMAL,
                    mapArray: [],
                    isVisible: true,
                    dateOfLastModification: new Date(),
                },
                {
                    _id: '1',
                    name: 'Mock Map 2',
                    mapDescription: '',
                    sizeRow: 0,
                    mode: GameMode.NORMAL,
                    mapArray: [],
                    isVisible: false,
                    dateOfLastModification: new Date(),
                },
            ],
            selectedMap: {
                _id: '0',
                name: 'Mock Map 1',
                mapDescription: '',
                sizeRow: 0,
                mode: GameMode.NORMAL,
                mapArray: [],
                isVisible: true,
                dateOfLastModification: new Date(),
            },
        });

        await TestBed.configureTestingModule({
            imports: [MapListComponent],
            providers: [{ provide: MapSelectionService, useValue: mapSelectionSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(MapListComponent);
        component = fixture.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('not empty loaded map list should have multiple elements in the menu', () => {
        const mapsElements = fixture.debugElement.queryAll(By.css('span'));
        expect(mapsElements.length).toBeGreaterThan(0);
    });

    it('clicking on a map name should select it', () => {
        spyOn(component, 'onSelectMap').and.callThrough();

        const mapNameElement = fixture.debugElement.query(By.css('#map0'));
        expect(mapNameElement).toBeTruthy();
        mapNameElement.nativeElement.click();

        expect(component.onSelectMap).toHaveBeenCalled();
        expect(mapSelectionSpy.chooseSelectedMap).toHaveBeenCalledWith(0);
    });

    it('clicking on something that is not a map name should not select', () => {
        spyOn(component, 'onSelectMap').and.callThrough();

        const dividerElement = fixture.debugElement.query(By.css('.divider'));
        expect(dividerElement).toBeTruthy();
        dividerElement.nativeElement.click();

        expect(component.onSelectMap).toHaveBeenCalled();
        expect(mapSelectionSpy.chooseSelectedMap).not.toHaveBeenCalled();
    });

    it('should hide hidden maps if showHidden is false', () => {
        component.showHidden = false;
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('#map1'))).toBeFalsy();
    });

    it('should display hidden maps if showHidden is true', () => {
        component.showHidden = true;
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('#map1'))).toBeTruthy();
    });
});
