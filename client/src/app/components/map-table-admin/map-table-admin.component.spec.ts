import { DatePipe } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DELETE_MAP_ERROR_TITLE, HIDE_UNHIDE_MAP_ERROR_TITLE, UPDATE_MAP_ERROR_TITLE } from '@app/constants/admin-API.constants';
import { mockMaps } from '@app/constants/tests.constants';
import { MapAdminService } from '@app/services/map-admin.service';
import { MapListService } from '@app/services/map-list.service';
import { MapSelectionService } from '@app/services/map-selection.service';
import { throwError } from 'rxjs';
import { MapTableAdminComponent } from './map-table-admin.component';
import SpyObj = jasmine.SpyObj;

describe('MapTableAdminComponent', () => {
    let component: MapTableAdminComponent;
    let fixture: ComponentFixture<MapTableAdminComponent>;
    let mapSelectionSpy: SpyObj<MapSelectionService>;
    let mapAdminSpy: SpyObj<MapAdminService>;
    let mapListSpy: SpyObj<MapListService>;
    let datePipe: DatePipe;
    let mockModalElement: ElementRef;
    beforeEach(async () => {
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['chooseSelectedMap']);
        mapAdminSpy = jasmine.createSpyObj('MapAdminService', ['toggleVisibility', 'delete', 'goToEditMap']);
        mapListSpy = jasmine.createSpyObj('MapListService', ['initialize', 'getMapsAPI'], { serviceMaps: mockMaps });
        await TestBed.configureTestingModule({
            providers: [
                DatePipe,
                { provide: MapSelectionService, useValue: mapSelectionSpy },
                { provide: MapAdminService, useValue: mapAdminSpy },
                { provide: MapListService, useValue: mapListSpy },
                provideHttpClientTesting(),
            ],
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
        fixture.detectChanges();
        const mapsElements = fixture.debugElement.queryAll(By.css('tbody tr'));
        expect(mapsElements.length).toBeGreaterThan(0);

        const firstRowCells = fixture.debugElement.queryAll(By.css('tbody tr:first-child td'));
        expect(firstRowCells[1].nativeElement.textContent.trim()).toBe(mockMaps[0].name);
        expect(firstRowCells[2].nativeElement.textContent.trim()).toBe(mockMaps[0].size.toString());
        expect(firstRowCells[3].nativeElement.textContent.trim()).toBe(mockMaps[0].mode.toString());
        expect(firstRowCells[4].nativeElement.textContent.trim()).toContain('1995');

        const secondRowCells = fixture.debugElement.queryAll(By.css('tbody tr:nth-child(2) td'));
        expect(secondRowCells[1].nativeElement.textContent.trim()).toBe(mockMaps[1].name);
        expect(secondRowCells[2].nativeElement.textContent.trim()).toBe(mockMaps[1].size.toString());
        expect(secondRowCells[3].nativeElement.textContent.trim()).toBe(mockMaps[1].mode.toString());
        expect(secondRowCells[4].nativeElement.textContent.trim()).toContain('1997');
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

        expect(mapAdminSpy.delete).toHaveBeenCalledWith(mapListSpy.serviceMaps[0]._id, mapListSpy.serviceMaps[0]);
    });

    it('should call not delete method when delete cancel button is clicked', () => {
        fixture.detectChanges();

        const deleteCancelButton = fixture.debugElement.query(By.css('.delete-cancel'));
        deleteCancelButton.nativeElement.click();

        expect(mapAdminSpy.delete).not.toHaveBeenCalled();
    });

    it('should show an error dialog when delete method throws an error', () => {
        mapAdminSpy.delete.and.returnValue(throwError(() => new Error('Delete failed')));

        fixture.detectChanges();

        const deleteConfirmButton = fixture.debugElement.query(By.css('.delete-confirm'));
        deleteConfirmButton.nativeElement.click();

        expect(component.currentErrorMessageTitle).toBe(DELETE_MAP_ERROR_TITLE);
        expect(component.currentErrorMessageBody).toBe('Delete failed');
        expect(component.standardMessageBox.nativeElement.open).toBeTrue();
    });

    it('should toggle the visibility of the map when the visibility toggle button is clicked', () => {
        fixture.detectChanges();

        const visibilityButtons = fixture.debugElement.queryAll(By.css('.toggle'));
        visibilityButtons[0].nativeElement.click();

        expect(mapAdminSpy.toggleVisibility).toHaveBeenCalledWith(mapListSpy.serviceMaps[0]);
    });

    it('should show an error dialog when toggleVisibility method throws an error', () => {
        mapAdminSpy.toggleVisibility.and.returnValue(throwError(() => new Error('Toggle failed')));

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

        expect(mapAdminSpy.goToEditMap).toHaveBeenCalledWith(mapListSpy.serviceMaps[0]);
    });

    it('should show an error dialog when editMap method throws an error', () => {
        mapAdminSpy.goToEditMap.and.returnValue(throwError(() => new Error('Edit failed')));

        fixture.detectChanges();

        const editButton = fixture.debugElement.query(By.css('.edit-btn'));
        editButton.nativeElement.click();

        expect(component.currentErrorMessageTitle).toBe(UPDATE_MAP_ERROR_TITLE);
        expect(component.currentErrorMessageBody).toBe('Edit failed');
        expect(component.standardMessageBox.nativeElement.open).toBeTrue();
    });

    it('The formatDate function should format the date correctly', () => {
        const date = new Date('2024-09-19T15:45:30Z');
        const formattedDate = component.formatDate(date);
        const format = 'MMM dd, yyyy hh:mm:ss a';
        const expectedDate = datePipe.transform(date, format) || '';
        expect(formattedDate).toBe(expectedDate);
    });

    it('should not call delete nor toggleVisibility nor the goToEditMap functions when clicking elsewhere in the row', () => {
        fixture.detectChanges();

        const mapNameCell = fixture.debugElement.query(By.css('tbody tr:first-child td.map-name-text'));
        mapNameCell.nativeElement.click();

        expect(mapAdminSpy.delete).not.toHaveBeenCalled();
        expect(mapAdminSpy.toggleVisibility).not.toHaveBeenCalled();
        expect(mapAdminSpy.goToEditMap).not.toHaveBeenCalled();
    });
});
