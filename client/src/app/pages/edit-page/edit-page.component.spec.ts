import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import { MapComponent } from '@app/components/edit-page/map.component';
import { SidebarComponent } from '@app/components/edit-page/sidebar.component';
import { mockFailValidationStatus, mockSuccessValidationStatus } from '@app/constants/tests.constants';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { of } from 'rxjs';
import { EditPageComponent } from './edit-page.component';
import SpyObj = jasmine.SpyObj;
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { VALIDATION_ERRORS } from '@app/constants/edit-page.constants';

const routes: Routes = [];

@Component({
    selector: 'app-map',
    standalone: true,
    template: '<div><div></div></div>',
})
class MockMapComponent {}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    template: '',
})
class MockSidebarComponent {}

describe('EditPageComponent', () => {
    let component: EditPageComponent;
    let mapManagerServiceSpy: SpyObj<MapManagerService>;
    let mapValidationServiceSpy: SpyObj<MapValidationService>;
    let fixture: ComponentFixture<EditPageComponent>;
    beforeEach(async () => {
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['selectTileType', 'handleSave'], { mapValidationStatus: of(true) });
        mapValidationServiceSpy = jasmine.createSpyObj('MapValidationService', ['validateMap']);
        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.overrideProvider(MapValidationService, { useValue: mapValidationServiceSpy });
        TestBed.overrideComponent(EditPageComponent, {
            add: { imports: [MockSidebarComponent, MockMapComponent] },
            remove: { imports: [SidebarComponent, MapComponent] },
        });

        await TestBed.configureTestingModule({
            imports: [EditPageComponent],
            providers: [provideHttpClientTesting(), provideRouter(routes)],
        }).compileComponents();
        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.debugElement.componentInstance;
        component.mapElement = new ElementRef(document.createElement('div'));
        component.messageDialog = new ElementRef(document.createElement('dialog'));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call selectTileType on destruction', () => {
        component.ngOnDestroy();
        expect(mapManagerServiceSpy.selectTileType).toHaveBeenCalled();
    });

    it('should set the form completion event listener on init', () => {
        spyOn(mapManagerServiceSpy.mapValidationStatus, 'subscribe').and.callThrough();
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
        const openDialogSpy = spyOn<any>(component, 'openDialog').and.callFake(() => {});
        component.ngOnInit();
        expect(mapManagerServiceSpy.mapValidationStatus.subscribe).toHaveBeenCalled();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('should open the dialog and set messages correctly for invalid map', () => {
        spyOn(component.messageDialog.nativeElement, 'showModal');

        component['openDialog'](mockFailValidationStatus);

        expect(component.validationTitle).toBe('La carte est invalide.');

        expect(component.validationMessage).toContain(VALIDATION_ERRORS.doorAndWallNumberValid);
        expect(component.validationMessage).toContain(VALIDATION_ERRORS.wholeMapAccessible);
        expect(component.validationMessage).toContain(VALIDATION_ERRORS.allStartPointsPlaced);
        expect(component.validationMessage).toContain(VALIDATION_ERRORS.flagPlaced);
        expect(component.validationMessage).toContain(VALIDATION_ERRORS.nameValid);
        expect(component.validationMessage).toContain(VALIDATION_ERRORS.descriptionValid);
    });

    it('should open the dialog and set messages correctly for valid map', () => {
        spyOn(component.messageDialog.nativeElement, 'showModal');
        component['openDialog'](mockSuccessValidationStatus);

        expect(component.messageDialog.nativeElement.showModal).toHaveBeenCalled();

        expect(component.validationTitle).toBe('La carte est valide.');
        expect(component.validationMessage).toBe('');
    });

    it('should call validateMap and handleSave on save button click', () => {
        component.onSave();
        expect(mapValidationServiceSpy.validateMap).toHaveBeenCalled();
        expect(mapManagerServiceSpy.handleSave).toHaveBeenCalled();
    });
});
