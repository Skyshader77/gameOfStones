import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterLink, Routes, provideRouter } from '@angular/router';
import { MapCreationFormComponent } from '@app/components/map-creation-form/map-creation-form.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let router: Router;
    const routes: Routes = [];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminPageComponent, FontAwesomeModule, RouterLink, MapCreationFormComponent],
            providers: [provideRouter(routes), provideHttpClientTesting(), provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should spawn the map creation form when the Create Map button is clicked', () => {
        spyOn(component.mapCreationModal.nativeElement, 'showModal');
        const button = fixture.debugElement.query(By.css('button'));
        button.triggerEventHandler('click', null);
        expect(component.mapCreationModal.nativeElement.showModal).toHaveBeenCalled();
    });

    it('should close the map creation form when it receives the right emitter', () => {
        spyOn(component.mapCreationModal.nativeElement, 'close');
        component.closeMapCreation();
        expect(component.mapCreationModal.nativeElement.close).toHaveBeenCalled();
    });

    it('should have correct routerLink for the Back button', () => {
        spyOn(router, 'navigateByUrl');
        const button = fixture.debugElement.query(By.css('button[routerLink="/init"]'));
        expect(button).toBeTruthy();
        const mockClick = new MouseEvent('click');
        button.nativeElement.dispatchEvent(mockClick);
        fixture.detectChanges();
        expect(router.navigateByUrl).toHaveBeenCalledWith(router.createUrlTree(['/init']), jasmine.anything());
    });
});
