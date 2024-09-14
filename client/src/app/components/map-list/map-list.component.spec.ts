import { ComponentFixture, TestBed } from '@angular/core/testing';
import SpyObj = jasmine.SpyObj;

import { By } from '@angular/platform-browser';
import { MapListService } from '@app/services/map-list.service';
import { MapListComponent } from './map-list.component';

describe('MapListComponent', () => {
    let component: MapListComponent;
    let fixture: ComponentFixture<MapListComponent>;
    let mapListSpy: SpyObj<MapListService>;

    beforeEach(async () => {
        mapListSpy = jasmine.createSpyObj('MapListService', ['chooseSelectedMap'], {
            mapList: [{ name: 'Mock Map 1' }, { name: 'Mock Map 2' }],
            selectedMap: { name: 'Mock Map 1' },
        });

        await TestBed.configureTestingModule({
            imports: [MapListComponent],
            providers: [{ provide: MapListService, useValue: mapListSpy }],
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
        expect(mapListSpy.chooseSelectedMap).toHaveBeenCalledWith(0);
    });

    it('clicking on something that is not a map name should not select', () => {
        spyOn(component, 'onSelectMap').and.callThrough();

        const dividerElement = fixture.debugElement.query(By.css('.divider'));
        expect(dividerElement).toBeTruthy();
        dividerElement.nativeElement.click();

        expect(component.onSelectMap).toHaveBeenCalled();
        expect(mapListSpy.chooseSelectedMap).not.toHaveBeenCalled();
    });
});
