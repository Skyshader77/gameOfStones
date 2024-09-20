import { DatePipe } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GameMode, MapSize } from '@app/interfaces/map';
import { MapSelectionService } from '@app/services/map-selection.service';
import { MapListAdminComponent } from './map-list-admin.component';
import SpyObj = jasmine.SpyObj;

describe('MapListAdminComponent', () => {
    let component: MapListAdminComponent;
    let fixture: ComponentFixture<MapListAdminComponent>;
    let mapSelectionSpy: SpyObj<MapSelectionService>;
    let datePipe: DatePipe;
    let mockModalElement: ElementRef;

    beforeEach(async () => {
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['chooseSelectedMap', 'toggleVisibility', 'delete', 'goToEditMap'], {
            maps: [
                {
                    _id: '0',
                    name: 'Mock Map 1',
                    description: '',
                    size: MapSize.SMALL,
                    mode: GameMode.NORMAL,
                    mapArray: [],
                    placedItems: [],
                    isVisible: true,
                    dateOfLastModification: new Date(),
                },
            ],
            selectedMap: {
                _id: '0',
                name: 'Mock Map 1',
                description: '',
                size: MapSize.SMALL,
                mode: GameMode.NORMAL,
                placedItems: [],
                mapArray: [],
                isVisible: true,
                dateOfLastModification: new Date(),
            },
        });
        await TestBed.configureTestingModule({
            providers: [DatePipe, { provide: MapSelectionService, useValue: mapSelectionSpy }, provideHttpClientTesting()],
            imports: [MapListAdminComponent],
        }).compileComponents();
        datePipe = TestBed.inject(DatePipe);
        fixture = TestBed.createComponent(MapListAdminComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        mockModalElement = { nativeElement: { showModal: jasmine.createSpy('showModal') } };
        component.deleteConfirmationModal = mockModalElement;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('not empty loaded map list should have multiple elements in the menu', () => {
        const mapsElements = fixture.debugElement.queryAll(By.css('tr'));
        expect(mapsElements.length).toBeGreaterThan(0);
    });

    it('should call chooseSelectedMap with the correct index when a radio button is clicked', () => {
        fixture.detectChanges();

        const radioButton: DebugElement = fixture.debugElement.query(By.css('input[type="radio"]'));
        expect(radioButton).toBeTruthy();

        radioButton.triggerEventHandler('click', { target: { type: 'radio', value: '0' } });

        expect(mapSelectionSpy.chooseSelectedMap).toHaveBeenCalledWith(0);
    });

    it('should call delete method when delete confirmation button is clicked', () => {
        fixture.detectChanges();

        const deleteConfirmButton = fixture.debugElement.query(By.css('.delete-confirm'));
        deleteConfirmButton.nativeElement.click();

        expect(mapSelectionSpy.delete).toHaveBeenCalledWith(mapSelectionSpy.maps[0]);
    });

    it('should toggle the visibility of the map when visibility button is clicked', () => {
        fixture.detectChanges();

        const visibilityButtons = fixture.debugElement.queryAll(By.css('.hiddentoggle'));
        visibilityButtons[0].nativeElement.click();

        expect(mapSelectionSpy.toggleVisibility).toHaveBeenCalledWith(mapSelectionSpy.maps[0]);
    });

    it('should call goToEditMap when the edit button is clicked', () => {
        fixture.detectChanges();

        const editButton = fixture.debugElement.query(By.css('.edit-btn'));
        editButton.nativeElement.click();

        expect(mapSelectionSpy.goToEditMap).toHaveBeenCalledWith(mapSelectionSpy.maps[0]);
    });

    it('should format the date correctly', () => {
        const date = new Date('2024-09-19T15:45:30Z');
        const formattedDate = component.formatDate(date);
        const format = 'ss:mm:yy MMM d, y';
        const expectedDate = datePipe.transform(date, format) || '';
        expect(formattedDate).toBe(expectedDate);
    });
});
