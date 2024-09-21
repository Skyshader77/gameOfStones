import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
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
    let mapManagerServiceSpy: SpyObj<MapManagerService>;
    let fixture: ComponentFixture<EditPageComponent>;
    beforeEach(async () => {
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['onInit'], {});
        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
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
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call initializeMap on initialization', () => {
        component.ngOnInit();
        expect(mapManagerServiceSpy.onInit).toHaveBeenCalled();
    });
});
