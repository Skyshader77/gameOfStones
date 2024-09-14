import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Routes, provideRouter, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { of, throwError } from 'rxjs';
import { SMALL_MAP_SIZE, FIVE_SECONDS } from 'src/app/constants/admin-API.constants';
import { GameMode, Map, TileTerrain, generateMapArray } from 'src/app/interfaces/map';
import { MapAPIService } from 'src/app/services/map-api.service';
import { AdminPageComponent } from './admin-page.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { faBackward, faEdit, faFileExport, faFileImport, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
@Component({
    selector: 'app-map-description',
    template: `
        <div id="mapDescriptionContainer" class="flex-1 text-left p-6">
            <ng-container *ngIf="showDescription && selectedMap; else noMapSelected">
                <h1 class="text-xl text-gray-200">Description de la carte de jeu</h1>
                <p class="text-gray-400">{{ selectedMap?.mapDescription }}</p>
            </ng-container>
            <ng-template #noMapSelected>
                <h1 class="text-xl text-gray-200">Aucune carte sélectionnée</h1>
                <p class="text-gray-400">Veuillez sélectionner une carte pour voir sa description.</p>
            </ng-template>
        </div>
    `,
})
class MapDescriptionComponent {
    showDescription: boolean = false;
    selectedMap: { mapDescription: string } | null = null;
}

@Component({
    selector: 'app-map-buttons',
    template: `
        <div class="flex justify-center items-center">
            <div class="flex space-x-4">
                <button class="btn btn-primary flex items-center space-x-2" routerLink="/edit">
                    <fa-icon [icon]="faPlus"></fa-icon>
                    <span>Creer une nouvelle carte de jeu</span>
                </button>
                <button class="btn btn-primary flex items-center space-x-2">
                    <fa-icon [icon]="faFileImport"></fa-icon>
                    <span>Importer une carte de jeu</span>
                </button>
                <button routerLink="/init" class="btn btn-primary flex items-center space-x-2">
                    <fa-icon [icon]="faBackward"></fa-icon>
                    <span>Retour</span>
                </button>
            </div>
        </div>
    `,
})
class HeaderButtonsComponent {
    faEdit = faEdit;
    faExport = faFileExport;
    faDelete = faX;
    faBackward = faBackward;
    faFileImport = faFileImport;
    faPlus = faPlus;
}

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let mapDescriptionComponent: MapDescriptionComponent;
    let headerButtonsComponent: HeaderButtonsComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let fixtureHeaderComponent: ComponentFixture<HeaderButtonsComponent>;
    let fixtureMapDescriptionComponent: ComponentFixture<MapDescriptionComponent>;
    let mapAPIService: jasmine.SpyObj<MapAPIService>;
    let router: Router;
    const routes: Routes = [];
    const mockMaps: Map[] = [
        {
            _id: 'Su27FLanker',
            name: 'Game of Drones',
            mapDescription: 'Test Map 1',
            sizeRow: 10,
            mode: GameMode.NORMAL,
            dateOfLastModification: new Date('December 17, 1995 03:24:00'),
            mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.GRASS),
            isVisible: true,
        },
        {
            _id: 'F35jsf',
            name: 'Engineers of War',
            mapDescription: 'Test Map 2',
            sizeRow: 15,
            mode: GameMode.CTF,
            dateOfLastModification: new Date('December 17, 1997 03:24:00'),
            mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.GRASS),
            isVisible: true,
        },
        {
            _id: 'Su27FLanker',
            name: 'Game of Thrones',
            mapDescription: 'Test Map 2.5',
            sizeRow: 10,
            mode: GameMode.CTF,
            dateOfLastModification: new Date('December 17, 1998 03:24:00'),
            mapArray: generateMapArray(SMALL_MAP_SIZE, TileTerrain.GRASS),
            isVisible: false,
        },
    ];

    beforeEach(async () => {
        const mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMaps', 'deleteMap', 'updateMap']);
        await TestBed.configureTestingModule({
            declarations: [HeaderButtonsComponent, MapDescriptionComponent],
            imports: [AdminPageComponent, FontAwesomeModule, RouterLink],
            providers: [{ provide: MapAPIService, useValue: mapAPISpy }, provideHttpClientTesting(), provideRouter(routes)],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        mapAPIService = TestBed.inject(MapAPIService) as jasmine.SpyObj<MapAPIService>;
        mapAPIService.getMaps.and.returnValue(of(mockMaps));
        fixture.detectChanges();

        fixtureHeaderComponent = TestBed.createComponent(HeaderButtonsComponent);
        headerButtonsComponent = fixtureHeaderComponent.componentInstance;
        fixtureHeaderComponent.detectChanges();

        fixtureMapDescriptionComponent = TestBed.createComponent(MapDescriptionComponent);
        mapDescriptionComponent = fixtureMapDescriptionComponent.componentInstance;
        fixtureMapDescriptionComponent.detectChanges();

        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(headerButtonsComponent).toBeTruthy();
        expect(mapDescriptionComponent).toBeTruthy();
    });

    it('should call getMaps on init and populate the maps', () => {
        expect(mapAPIService.getMaps).toHaveBeenCalled();
        expect(component.maps.length).toBe(mockMaps.length);
    });

    it('should delete a map and show success alert', () => {
        mapAPIService.deleteMap.and.returnValue(of(null));

        const mapToDelete = mockMaps[0];
        component.delete(mapToDelete);

        expect(mapAPIService.deleteMap).toHaveBeenCalledWith(mapToDelete._id);

        expect(component.maps.length).toBe(mockMaps.length - 1);
        expect(component.maps).not.toContain(mapToDelete);

        expect(component.alertMessage).toBe('Map has been successfully deleted!');
        expect(component.alertType).toBe('success');
    });

    it('should handle deletion error and show error alert', () => {
        const errorResponse = new Error('Map could not be found or has been deleted by someone else');
        mapAPIService.deleteMap.and.returnValue(throwError(() => errorResponse));
        const mapToDelete = mockMaps[0];
        component.delete(mapToDelete);

        expect(mapAPIService.deleteMap).toHaveBeenCalledWith(mapToDelete._id);

        expect(component.maps.length).toBe(mockMaps.length - 1);
        expect(component.alertMessage).toBe('Error! Map could not be found.');
        expect(component.alertType).toBe('error');
    });

    it('should select a map when selectMap is called', () => {
        const mapToSelect = mockMaps[0];
        component.selectMap(mapToSelect);

        expect(component.selectedMap).toBe(mapToSelect);
    });

    it('should toggle map visibility and update map', () => {
        const mapToToggle = mockMaps[0];
        const updatedMap = { ...mapToToggle, isVisible: !mapToToggle.isVisible };
        mapAPIService.updateMap.and.returnValue(of(updatedMap));

        component.toggleVisibility(mapToToggle);

        expect(mapAPIService.updateMap).toHaveBeenCalledWith(mapToToggle._id, updatedMap);

        expect(component.maps.find((m) => m._id === mapToToggle._id)?.isVisible).toBe(updatedMap.isVisible);
    });

    it('should handle visibility update error and show error alert', () => {
        const errorResponse = new Error('Update failed');
        mapAPIService.updateMap.and.returnValue(throwError(() => errorResponse));

        const mapToToggle = mockMaps[0];
        const previousVisibility = mapToToggle.isVisible;
        component.toggleVisibility(mapToToggle);

        expect(mapAPIService.updateMap).toHaveBeenCalledWith(mapToToggle._id, { ...mapToToggle, isVisible: !previousVisibility });
        expect(component.maps.find((m) => m._id === mapToToggle._id)?.isVisible).toBe(previousVisibility);
        expect(component.alertMessage).toBe('Error! Map visibility could not be updated.');
        expect(component.alertType).toBe('error');
    });

    it('should navigate to the edit route with the correct map in state', () => {
        const searchedMap: Map = mockMaps[0];
        const navigateSpy = spyOn(router, 'navigate');

        component.goToEditMap(searchedMap);

        expect(navigateSpy).toHaveBeenCalledWith(['/edit'], { state: { searchedMap } });
    });

    it('should display the map description when the map preview is hovered on and the user has selected a map', () => {
        mapDescriptionComponent.showDescription = true;
        mapDescriptionComponent.selectedMap = { mapDescription: 'This is a test map description.' };

        fixtureMapDescriptionComponent.detectChanges();

        const descriptionElement = fixtureMapDescriptionComponent.debugElement.query(By.css('p.text-gray-400'));
        expect(descriptionElement).toBeTruthy();
        expect(descriptionElement.nativeElement.textContent).toContain('This is a test map description');
    });

    it('should display "Aucune carte sélectionnée" when no map is selected', () => {
        mapDescriptionComponent.showDescription = false;
        mapDescriptionComponent.selectedMap = null;

        fixtureMapDescriptionComponent.detectChanges();

        const noMapSelectedHeader = fixtureMapDescriptionComponent.debugElement.query(By.css('h1.text-xl'));
        const noMapSelectedParagraph = fixtureMapDescriptionComponent.debugElement.query(By.css('p.text-gray-400'));

        expect(noMapSelectedHeader).toBeTruthy();
        expect(noMapSelectedHeader.nativeElement.textContent).toContain('Aucune carte sélectionnée');
        expect(noMapSelectedParagraph.nativeElement.textContent).toContain('Veuillez sélectionner une carte pour voir sa description.');
    });

    it('should have correct routerLink for the Create Map button', () => {
        const button = fixtureHeaderComponent.debugElement.query(By.css('button[routerLink="/edit"]'));
        expect(button).toBeTruthy();
        expect(button.attributes['ng-reflect-router-link']).toBe('/edit');
    });

    it('should have correct routerLink for the Back button', () => {
        const button = fixtureHeaderComponent.debugElement.query(By.css('button[routerLink="/init"]'));
        expect(button).toBeTruthy();
        expect(button.attributes['ng-reflect-router-link']).toBe('/init');
    });

    it('should clear alert message and type after 5 seconds', fakeAsync(() => {
        component.alertMessage = 'Test message';
        component.alertType = 'success';

        component['clearAlertAfterDelay']();

        tick(FIVE_SECONDS);

        expect(component.alertMessage).toBe('');
        expect(component.alertType).toBeNull();
    }));
});
