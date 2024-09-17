import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterLink, Routes, provideRouter } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faEdit, faFileExport, faFileImport, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { AdminPageComponent } from './admin-page.component';

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
    let fixture: ComponentFixture<AdminPageComponent>;
    let fixtureHeaderComponent: ComponentFixture<HeaderButtonsComponent>;
    const routes: Routes = [];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HeaderButtonsComponent],
            imports: [AdminPageComponent, FontAwesomeModule, RouterLink],
            providers: [provideRouter(routes), provideHttpClientTesting(), provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        fixtureHeaderComponent = TestBed.createComponent(HeaderButtonsComponent);
        fixtureHeaderComponent.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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
});
