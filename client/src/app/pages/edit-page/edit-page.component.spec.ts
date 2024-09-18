import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import { EditPageService } from '@app/services/edit-page.service';
import { EditPageComponent } from './edit-page.component';
import { MapComponent } from './map.component';
import { SidebarComponent } from './sidebar.component';
import SpyObj = jasmine.SpyObj;

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

describe('EditPageComponent', () => {
    let component: EditPageComponent;
    let editPageServiceSpy: SpyObj<EditPageService>;
    let fixture: ComponentFixture<EditPageComponent>;
    beforeEach(async () => {
        editPageServiceSpy = jasmine.createSpyObj('EditPageService', ['initializeMap']);

        TestBed.overrideComponent(MapComponent, { add: { imports: [MockMapComponent] }, remove: { imports: [MapComponent] } });
        TestBed.overrideComponent(SidebarComponent, { add: { imports: [MockSidebarComponent] }, remove: { imports: [SidebarComponent] } });
        await TestBed.configureTestingModule({
            imports: [EditPageComponent],
            providers: [{ provide: EditPageService, useValue: editPageServiceSpy }, provideHttpClientTesting(), provideRouter(routes)],
        }).compileComponents();
        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call initializeMap on initialization', () => {
        component.ngOnInit();
        expect(editPageServiceSpy.initializeMap).toHaveBeenCalled();
    });
});
