import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink, Routes } from '@angular/router';
import { InitPageComponent } from './init-page.component';

describe('InitPageComponent', () => {
    let component: InitPageComponent;
    let fixture: ComponentFixture<InitPageComponent>;
    let router: Router;
    const routes: Routes = [];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InitPageComponent, RouterLink],
            providers: [provideRouter(routes)],
        }).compileComponents();

        fixture = TestBed.createComponent(InitPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have correct routerLink for the "Créer" button', () => {
        spyOn(router, 'navigateByUrl');
        const button = fixture.debugElement.query(By.css('button[routerLink="/create"]'));
        expect(button).toBeTruthy();
        const mockClick = new MouseEvent('click');
        button.nativeElement.dispatchEvent(mockClick);
        fixture.detectChanges();
        expect(router.navigateByUrl).toHaveBeenCalledWith(router.createUrlTree(['/create']), jasmine.anything());
    });

    it('should have correct routerLink for the "Administrer" button', () => {
        spyOn(router, 'navigateByUrl');
        const button = fixture.debugElement.query(By.css('button[routerLink="/admin"]'));
        expect(button).toBeTruthy();
        const mockClick = new MouseEvent('click');
        button.nativeElement.dispatchEvent(mockClick);
        fixture.detectChanges();
        expect(router.navigateByUrl).toHaveBeenCalledWith(router.createUrlTree(['/admin']), jasmine.anything());
    });
});
