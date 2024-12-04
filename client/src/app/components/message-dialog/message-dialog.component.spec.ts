import { ErrorHandler } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAX_MAP_NAME_LENGTH } from '@app/constants/admin.constants';
import { MOCK_MODAL_MESSAGE } from '@app/constants/tests.constants';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { of, throwError } from 'rxjs';
import { MessageDialogComponent } from './message-dialog.component';

describe('MessageDialogComponent', () => {
    let component: MessageDialogComponent;
    let modalMessageSpy: jasmine.SpyObj<ModalMessageService>;
    let fixture: ComponentFixture<MessageDialogComponent>;
    let errorHandlerSpy: jasmine.SpyObj<ErrorHandler>;

    beforeEach(async () => {
        modalMessageSpy = jasmine.createSpyObj(
            'ModalMessageService',
            ['setMessage', 'getStoredMessage', 'clearMessage', 'emitUserInput', 'onSubmit', 'isInputValid'],
            {
                message$: of(),
            },
        );
        errorHandlerSpy = jasmine.createSpyObj('ErrorHandler', ['handleError']);
        await TestBed.configureTestingModule({
            imports: [MessageDialogComponent],
            providers: [
                { provide: ModalMessageService, useValue: modalMessageSpy },
                { provide: ErrorHandler, useValue: errorHandlerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MessageDialogComponent);
        component = fixture.debugElement.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open modal on message', () => {
        spyOn(component.dialog.nativeElement, 'showModal');
        Object.defineProperty(modalMessageSpy, 'message$', {
            get: () => of(MOCK_MODAL_MESSAGE),
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

    it('should emit event on close', () => {
        spyOn(component.closeEvent, 'emit');
        component.onClose();
        expect(component.closeEvent.emit).toHaveBeenCalled();
    });

    it('should subscribe on after view init', () => {
        spyOn(modalMessageSpy.message$, 'subscribe').and.callThrough();
        component.ngAfterViewInit();
        expect(modalMessageSpy.message$.subscribe).toHaveBeenCalled();
    });

    it('should unsubscribe on destroy', () => {
        spyOn(component['subscription'], 'unsubscribe').and.callThrough();
        component.ngOnDestroy();
        expect(component['subscription'].unsubscribe).toHaveBeenCalled();
    });

    it('should reset message when close is clicked', () => {
        component.resetMessage();
        expect(modalMessageSpy.clearMessage).toHaveBeenCalled();
        expect(component.message).toBeNull();
        expect(component.userInput).toBe('');
    });

    it('should validate input correctly', () => {
        component.userInput = 'Valid Input';
        expect(component.isInputValid()).toBeTrue();

        component.userInput = ' ';
        expect(component.isInputValid()).toBeFalse();

        component.userInput = 'A'.repeat(MAX_MAP_NAME_LENGTH + 1);
        expect(component.isInputValid()).toBeFalse();
    });

    it('should submit when input is valid', () => {
        component.userInput = 'Valid Input';
        component.onSubmit();
        expect(modalMessageSpy.emitUserInput).toHaveBeenCalledWith('Valid Input');
    });

    it('should not submit when input is invalid', () => {
        component.userInput = ' ';
        component.onSubmit();
        expect(modalMessageSpy.emitUserInput).not.toHaveBeenCalled();
    });

    it('should handle enter keydown event', () => {
        spyOn(component, 'isInputValid').and.returnValue(true);
        spyOn(component, 'onSubmit');
        const mockEvent = { preventDefault: jasmine.createSpy(), key: 'Enter' } as unknown as KeyboardEvent;

        component.onKeyDown(mockEvent);

        expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should not submit on enter keydown if input is invalid', () => {
        spyOn(component, 'isInputValid').and.returnValue(false);
        spyOn(component, 'onSubmit');
        const mockEvent = { preventDefault: jasmine.createSpy(), key: 'Enter' } as unknown as KeyboardEvent;

        component.onKeyDown(mockEvent);

        expect(component.onSubmit).not.toHaveBeenCalled();
    });

    it('should handle error in message$ observable', () => {
        const errorMessage = new Error('Test error');
        const errorObservable = throwError(() => errorMessage);

        Object.defineProperty(modalMessageSpy, 'message$', {
            get: () => errorObservable,
        });

        component.ngAfterViewInit();

        expect(errorHandlerSpy.handleError).toHaveBeenCalledWith(errorMessage);
    });
});
