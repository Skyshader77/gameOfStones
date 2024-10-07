import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorDialogComponent } from './error-dialog.component';
import { ErrorMessageService } from '@app/services/utilitary/error-message.service';
import { of } from 'rxjs';
import { MOCK_ERROR_MESSAGE } from '@app/constants/tests.constants';

describe('ErrorDialogComponent', () => {
    let component: ErrorDialogComponent;
    let errorMessageSpy: jasmine.SpyObj<ErrorMessageService>;
    let fixture: ComponentFixture<ErrorDialogComponent>;

    beforeEach(async () => {
        errorMessageSpy = jasmine.createSpyObj('ErrorMessageService', ['reset'], {
            message$: of(null),
        });
        await TestBed.configureTestingModule({
            imports: [ErrorDialogComponent],
            providers: [{ provide: ErrorMessageService, useValue: errorMessageSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorDialogComponent);
        component = fixture.debugElement.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open modal on message', () => {
        spyOn(component.dialog.nativeElement, 'showModal');
        Object.defineProperty(errorMessageSpy, 'message$', {
            get: () => of(MOCK_ERROR_MESSAGE),
        });
        fixture.detectChanges();

        component.ngAfterViewInit();
        expect(component.dialog.nativeElement.showModal).toHaveBeenCalled();
    });

    it('should not open modal on null message', () => {
        spyOn(component.dialog.nativeElement, 'showModal');

        component.ngAfterViewInit();
        expect(component.dialog.nativeElement.showModal).not.toHaveBeenCalled();
    });

    it('should reset the service on close', () => {
        component.onClose();
        expect(errorMessageSpy.reset).toHaveBeenCalled();
    });
});
