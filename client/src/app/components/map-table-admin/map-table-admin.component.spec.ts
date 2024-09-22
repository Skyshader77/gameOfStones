import { DatePipe } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DELETE_MAP_ERROR_TITLE, HIDE_UNHIDE_MAP_ERROR_TITLE } from '@app/constants/admin-API.constants';
import { GameMode, MapSize } from '@app/interfaces/map';
import { MapSelectionService } from '@app/services/map-selection.service';
import { throwError } from 'rxjs';
import { MapTableAdminComponent } from './map-table-admin.component';
import SpyObj = jasmine.SpyObj;

describe('MapTableAdminComponent', () => {
    let component: MapTableAdminComponent;
    let fixture: ComponentFixture<MapTableAdminComponent>;
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
            imports: [MapTableAdminComponent],
        }).compileComponents();
        datePipe = TestBed.inject(DatePipe);
        fixture = TestBed.createComponent(MapTableAdminComponent);
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

    it('should show an error dialog when delete method throws an error', () => {
        mapSelectionSpy.delete.and.returnValue(throwError(() => new Error('Delete failed')));

        fixture.detectChanges();

        const deleteConfirmButton = fixture.debugElement.query(By.css('.delete-confirm'));
        deleteConfirmButton.nativeElement.click();

        expect(component.currentErrorMessageTitle).toBe(DELETE_MAP_ERROR_TITLE);
        expect(component.currentErrorMessageBody).toBe('Delete failed');
        expect(component.standardMessageBox.nativeElement.open).toBeTrue();
    });

    it('should toggle the visibility of the map when visibility button is clicked', () => {
        fixture.detectChanges();

        const visibilityButtons = fixture.debugElement.queryAll(By.css('.toggle'));
        visibilityButtons[0].nativeElement.click();

        expect(mapSelectionSpy.toggleVisibility).toHaveBeenCalledWith(mapSelectionSpy.maps[0]);
    });

    it('should show an error dialog when toggleVisibility method throws an error', () => {
        mapSelectionSpy.toggleVisibility.and.returnValue(throwError(() => new Error('Toggle failed')));

        fixture.detectChanges();

        const visibilityButtons = fixture.debugElement.queryAll(By.css('.toggle'));
        visibilityButtons[0].nativeElement.click();

        expect(component.currentErrorMessageTitle).toBe(HIDE_UNHIDE_MAP_ERROR_TITLE);
        expect(component.currentErrorMessageBody).toBe('Toggle failed');
        expect(component.standardMessageBox.nativeElement.open).toBeTrue();
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
