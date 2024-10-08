/* eslint-disable max-classes-per-file */

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';
import { SidebarComponent } from '@app/components/edit-page/sidebar.component';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { of } from 'rxjs';
import { EditPageComponent } from './edit-page.component';
import SpyObj = jasmine.SpyObj;
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { CREATION_EDITION_ERROR_TITLES } from '@app/constants/edit-page.constants';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { MapComponent } from '@app/components/edit-page/map.component';

const routes: Routes = [];

@Component({
    selector: 'app-map',
    standalone: true,
    template: '',
})
class MockMapComponent {}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    template: '',
})
class MockSidebarComponent {}

@Component({
    selector: 'app-message-dialog',
    standalone: true,
    template: '',
})
class MockErrorDialogComponent {}

describe('EditPageComponent', () => {
    let component: EditPageComponent;
    let mapManagerServiceSpy: SpyObj<MapManagerService>;
    let mapValidationServiceSpy: SpyObj<MapValidationService>;
    let fixture: ComponentFixture<EditPageComponent>;
    let router: Router;

    beforeEach(async () => {
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['selectTileType', 'handleSave'], { mapValidationStatus: of(true) });
        mapValidationServiceSpy = jasmine.createSpyObj('MapValidationService', ['validateMap']);

        await TestBed.configureTestingModule({
            imports: [EditPageComponent],
            providers: [
                { provide: MapManagerService, useValue: mapManagerServiceSpy },
                { provide: MapValidationService, useValue: mapValidationServiceSpy },
                provideHttpClientTesting(),
                provideRouter(routes),
            ],
        })
            .overrideComponent(EditPageComponent, {
                add: { imports: [MockMapComponent, MockSidebarComponent, MockErrorDialogComponent] },
                remove: { imports: [MapComponent, SidebarComponent, MessageDialogComponent] },
            })
            .compileComponents();

        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.debugElement.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call selectTileType on destruction', () => {
        component.ngOnDestroy();
        expect(mapManagerServiceSpy.selectTileType).toHaveBeenCalled();
    });

    it('should navigate to admin page on success', () => {
        spyOn(router, 'navigate');
        component.onSuccessfulSave();
        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should call validateMap and handleSave on save button click', () => {
        expect(component.mapElement).toBeDefined();
        mapManagerServiceSpy.handleSave.and.returnValue(of(''));
        component.onSave();
        expect(mapValidationServiceSpy.validateMap).toHaveBeenCalled();
        expect(mapManagerServiceSpy.handleSave).toHaveBeenCalled();
    });

    it('should open the success modal on valid save', () => {
        const modalSpy = spyOn(component.successDialog.nativeElement, 'showModal');
        fixture.detectChanges();
        mapManagerServiceSpy.handleSave.and.returnValue(of(CREATION_EDITION_ERROR_TITLES.creation));
        component.onSave();
        expect(modalSpy).toHaveBeenCalledWith();
        expect(component.successMessage).toEqual(CREATION_EDITION_ERROR_TITLES.creation);
    });
});
