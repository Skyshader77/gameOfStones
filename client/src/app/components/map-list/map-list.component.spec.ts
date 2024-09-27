import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { mockMaps } from '@app/constants/tests.constants';
import { MapListService } from '@app/services/map-list.service';
import { MapSelectionService } from '@app/services/map-selection.service';
import { MapListComponent } from './map-list.component';
import SpyObj = jasmine.SpyObj;
describe('MapListComponent', () => {
    let component: MapListComponent;
    let fixture: ComponentFixture<MapListComponent>;
    let mapSelectionSpy: SpyObj<MapSelectionService>;
    let mapListSpy: SpyObj<MapListService>;
    beforeEach(async () => {
        mapListSpy = jasmine.createSpyObj('MapListService', ['getMapsAPI'], {
            serviceMaps: mockMaps,
        });
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['chooseSelectedMap']);
        await TestBed.configureTestingModule({
            imports: [MapListComponent],
            providers: [
                { provide: MapListService, useValue: mapListSpy },
                { provide: MapSelectionService, useValue: mapSelectionSpy },
                provideHttpClientTesting(),
            ],
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

        const mapNameElement = fixture.debugElement.query(By.css('#map1'));
        expect(mapNameElement).toBeTruthy();
        mapNameElement.nativeElement.click();

        expect(component.onSelectMap).toHaveBeenCalled();
        expect(mapSelectionSpy.chooseSelectedMap).toHaveBeenCalledWith(1);
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
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#map0'))).toBeFalsy();
    });
});
