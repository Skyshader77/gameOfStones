import { DatePipe } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RADIX } from '@app/constants/edit-page.constants';
import { MOCK_MAPS } from '@app/constants/tests.constants';
import { MapAdminService } from '@app/services/admin-services/map-admin/map-admin.service';
import { MapExportService } from '@app/services/admin-services/map-export/map-export.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection/map-selection.service';
import { MapTableAdminComponent } from './map-table-admin.component';
import SpyObj = jasmine.SpyObj;

const FIRST_YEAR = '1995';
const MOCK_DATE = new Date('2024-09-19T15:45:30Z');

describe('MapTableAdminComponent', () => {
    let component: MapTableAdminComponent;
    let fixture: ComponentFixture<MapTableAdminComponent>;
    let mapSelectionSpy: SpyObj<MapSelectionService>;
    let mapAdminSpy: SpyObj<MapAdminService>;
    let mapListSpy: SpyObj<MapListService>;
    let datePipe: DatePipe;
    let mockModalElement: ElementRef;
    let mapExportSpy: SpyObj<MapExportService>;

    function getModeText(mode: number): string {
        switch (mode) {
            case 0:
                return 'Normal';
            case 1:
                return 'Capture du Drapeau';
            default:
                return 'Inconnu';
        }
    }

    beforeEach(async () => {
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['chooseSelectedMap']);
        mapAdminSpy = jasmine.createSpyObj('MapAdminService', ['toggleVisibilityMap', 'deleteMap', 'editMap']);
        mapListSpy = jasmine.createSpyObj('MapListService', ['initialize', 'getMapsAPI'], { serviceMaps: MOCK_MAPS });
        mapExportSpy = jasmine.createSpyObj('MapExportService', ['exportMap']);
        await TestBed.configureTestingModule({
            providers: [
                DatePipe,
                { provide: MapSelectionService, useValue: mapSelectionSpy },
                { provide: MapAdminService, useValue: mapAdminSpy },
                { provide: MapListService, useValue: mapListSpy },
                { provide: MapExportService, useValue: mapExportSpy },
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

    it('should display skeleton loader when data is loading', () => {
        Object.defineProperty(mapListSpy, 'isLoaded', {
            get: jasmine.createSpy('getIsLoaded').and.returnValue(false),
        });
        fixture.detectChanges();
        const skeletonElement = fixture.debugElement.query(By.css('.skeleton'));
        expect(skeletonElement).toBeTruthy();
    });

    it('should render a populated map list when maps are available', () => {
        fixture.detectChanges();
        const mapsElements = fixture.debugElement.queryAll(By.css('tbody tr'));
        expect(mapsElements.length).toBeGreaterThan(0);

        const firstRowCells = fixture.debugElement.queryAll(By.css('tbody tr:first-child td'));
        expect(firstRowCells[0].nativeElement.textContent.trim()).toBe(MOCK_MAPS[0].name);
        expect(firstRowCells[1].nativeElement.textContent.trim()).toBe(MOCK_MAPS[0].size.toString());
        expect(firstRowCells[2].nativeElement.textContent.trim()).toBe(getModeText(MOCK_MAPS[0].mode));
        expect(firstRowCells[3].nativeElement.textContent.trim()).toContain(FIRST_YEAR);
    });

    it('should call delete method when confirmation button is clicked', () => {
        fixture.detectChanges();
        const deleteConfirmButton = fixture.debugElement.query(By.css('.delete-confirm'));
        deleteConfirmButton.nativeElement.click();
        expect(mapAdminSpy.deleteMap).toHaveBeenCalledWith(MOCK_MAPS[0]._id, MOCK_MAPS[0]);
    });

    it('should not call delete method when cancel button is clicked', () => {
        fixture.detectChanges();
        const deleteCancelButton = fixture.debugElement.query(By.css('.delete-cancel'));
        deleteCancelButton.nativeElement.click();
        expect(mapAdminSpy.deleteMap).not.toHaveBeenCalled();
    });

    it('should toggle the visibility of the map when the visibility toggle button is clicked', () => {
        fixture.detectChanges();
        const visibilityButtons = fixture.debugElement.queryAll(By.css('.toggle'));
        visibilityButtons[0].nativeElement.click();
        expect(mapAdminSpy.toggleVisibilityMap).toHaveBeenCalledWith(MOCK_MAPS[0]);
    });

    it('should call goToEditMap when the edit button is clicked', () => {
        fixture.detectChanges();
        const editButton = fixture.debugElement.query(By.css('.edit-btn'));
        editButton.nativeElement.click();
        expect(mapAdminSpy.editMap).toHaveBeenCalledWith(MOCK_MAPS[0]);
    });

    it('should correctly format the date', () => {
        const formattedDate = component.formatDate(MOCK_DATE);
        const format = 'MMM dd, yyyy hh:mm:ss a';
        const expectedDate = datePipe.transform(MOCK_DATE, format) || '';
        expect(formattedDate).toBe(expectedDate);
    });

    it('should not trigger map actions when clicking outside buttons', () => {
        fixture.detectChanges();
        const mapNameCell = fixture.debugElement.query(By.css('tbody tr:first-child td.map-name-text'));
        mapNameCell.nativeElement.click();
        expect(mapAdminSpy.deleteMap).not.toHaveBeenCalled();
        expect(mapAdminSpy.toggleVisibilityMap).not.toHaveBeenCalled();
        expect(mapAdminSpy.editMap).not.toHaveBeenCalled();
    });

    it('should call exportMap method from MapExportService when export button is clicked', () => {
        const exportButton = fixture.debugElement.query(By.css('.export-btn'));
        exportButton.nativeElement.click();
        expect(mapExportSpy.exportMap).toHaveBeenCalledWith(MOCK_MAPS[0]);
    });

    it('should apply the "active" class when a map is selected', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: jasmine.createSpy('getSelectedMap').and.returnValue(MOCK_MAPS[0]),
        });

        fixture.detectChanges();

        const activeRow = fixture.debugElement.query(By.css('tbody tr.active'));
        expect(activeRow).toBeTruthy();
    });

    it('should call chooseSelectedMap when a radio button is selected', () => {
        const selectedMapIndex = '0';
        const mockEvent = {
            target: {
                type: 'radio',
                value: selectedMapIndex,
            },
        } as unknown as MouseEvent;

        component.onSelectMap(mockEvent);

        expect(mapSelectionSpy.chooseSelectedMap).toHaveBeenCalledWith(parseInt(selectedMapIndex, RADIX));
    });
});
