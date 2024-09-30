import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Route } from '@angular/router';
import { InitPageComponent } from './init-page.component';

const routes: Route[] = [];

describe('InitPageComponent', () => {
    let component: InitPageComponent;
    let fixture: ComponentFixture<InitPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InitPageComponent],
            providers: [provideRouter(routes)],
        }).compileComponents();

        fixture = TestBed.createComponent(InitPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have correct routerLink for the "Créer" button', () => {
        const button = fixture.debugElement.query(By.css('button[routerLink="/create"]'));
        expect(button).toBeTruthy();
        expect(button.attributes['ng-reflect-router-link']).toBe('/create');
    });

    it('should have correct routerLink for the "Administrer" button', () => {
        const button = fixture.debugElement.query(By.css('button[routerLink="/admin"]'));
        expect(button).toBeTruthy();
        expect(button.attributes['ng-reflect-router-link']).toBe('/admin');
    });
});
