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

    it('should open the dialog and set messages correctly for invalid map', () => {
        const mockValidationStatus = {
            doorAndWallNumberValid: false,
            wholeMapAccessible: false,
            allStartPointsPlaced: false,
            doorSurroundingsValid: false,
            flagPlaced: false,
            allItemsPlaced: false,
            nameValid: false,
            descriptionValid: false,
            isMapValid: false,
        };

        const dialogSpy = jasmine.createSpyObj('HTMLDialogElement', ['showModal']);
        spyOn(document, 'getElementById').and.returnValue(dialogSpy);

        component.openDialog(mockValidationStatus);

        expect(dialogSpy.showModal).toHaveBeenCalled();
        expect(component.validationTitle).toBe('La carte est invalide.');
        expect(component.validationMessage).toContain('Il y a trop de murs et de portes sur la carte.');
        expect(component.validationMessage).toContain('Certaines parties de la carte sont inaccessibles dû à un agencement de murs.');
        expect(component.validationMessage).toContain("Certains points de départ n'ont pas été placés.");
        expect(component.validationMessage).toContain("L'encadrement de certaines portes est invalide.");
        expect(component.validationMessage).toContain("Le drapeau n'a pas été placé.");
    });

    it('should open the dialog and set messages correctly for valid map', () => {
        const mockValidationStatus = {
            doorAndWallNumberValid: true,
            wholeMapAccessible: true,
            allStartPointsPlaced: true,
            doorSurroundingsValid: true,
            flagPlaced: true,
            allItemsPlaced: true,
            nameValid: true,
            descriptionValid: true,
            isMapValid: true,
        };

        const dialogSpy = jasmine.createSpyObj('HTMLDialogElement', ['showModal']);
        spyOn(document, 'getElementById').and.returnValue(dialogSpy);

        component.openDialog(mockValidationStatus);

        expect(dialogSpy.showModal).toHaveBeenCalled();

        expect(component.validationTitle).toBe('La carte est valide!');
        expect(component.validationMessage).toBe('');
    });
});
