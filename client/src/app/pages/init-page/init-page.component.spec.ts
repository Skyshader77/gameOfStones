import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, Routes } from '@angular/router';
import { MOCK_MODAL_MESSAGE } from '@app/constants/tests.constants';
import { of } from 'rxjs';
import { InitPageComponent } from './init-page.component';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';

describe('InitPageComponent', () => {
    let component: InitPageComponent;
    let fixture: ComponentFixture<InitPageComponent>;
    let router: Router;
    const routes: Routes = [];
    let modalMessageSpy: jasmine.SpyObj<ModalMessageService>;

    beforeEach(async () => {
        modalMessageSpy = jasmine.createSpyObj('ModalMessageService', ['showMessage', 'setMessage', 'getStoredMessage'], {
            message$: of(null),
            decisionMessage$: of(null),
        });

        await TestBed.configureTestingModule({
            imports: [InitPageComponent],
            providers: [{ provide: ModalMessageService, useValue: modalMessageSpy }, provideRouter(routes)],
        }).compileComponents();

        fixture = TestBed.createComponent(InitPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);

        modalMessageSpy.getStoredMessage.and.returnValue(MOCK_MODAL_MESSAGE);

        fixture.detectChanges();
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

    it('should call showMessage if there is a stored message', () => {
        component.ngAfterViewInit();
        expect(modalMessageSpy.showMessage).toHaveBeenCalledWith(MOCK_MODAL_MESSAGE);
    });
});
