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
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { EditMapComponent } from '@app/components/edit-page/edit-map.component';

const routes: Routes = [];

@Component({
    selector: 'app-edit-map',
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
                remove: { imports: [EditMapComponent, SidebarComponent, MessageDialogComponent] },
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
        component['wasSuccessful'] = true;
        component.onSuccessfulSave();
        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should not navigate to admin page on fail', () => {
        spyOn(router, 'navigate');
        component['wasSuccessful'] = false;
        component.onSuccessfulSave();
        expect(router.navigate).not.toHaveBeenCalledWith(['/admin']);
    });

    it('should call validateMap and handleSave on save button click', () => {
        expect(component.editMapElement).toBeDefined();
        mapManagerServiceSpy.handleSave.and.returnValue(of(false));
        component.onSave();
        expect(mapValidationServiceSpy.validateMap).toHaveBeenCalled();
        expect(mapManagerServiceSpy.handleSave).toHaveBeenCalled();
    });

    it('should set wasSuccessful to true on valid save', () => {
        mapManagerServiceSpy.handleSave.and.returnValue(of(true));
        component.onSave();
        expect(component['wasSuccessful']).toBeTrue();
    });
});
