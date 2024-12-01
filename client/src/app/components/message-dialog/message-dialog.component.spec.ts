import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageDialogComponent } from './message-dialog.component';
import { of, Observable } from 'rxjs';
import { MOCK_MODAL_MESSAGE } from '@app/constants/tests.constants';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { MAX_MAP_NAME_LENGTH } from '@app/constants/admin.constants';

describe('MessageDialogComponent', () => {
    let component: MessageDialogComponent;
    let modalMessageSpy: jasmine.SpyObj<ModalMessageService>;
    let fixture: ComponentFixture<MessageDialogComponent>;

    beforeEach(async () => {
        modalMessageSpy = jasmine.createSpyObj('ModalMessageService', ['setMessage', 'getStoredMessage', 'clearMessage', 'emitUserInput'], {
            message$: of(),
        });
        await TestBed.configureTestingModule({
            imports: [MessageDialogComponent],
            providers: [{ provide: ModalMessageService, useValue: modalMessageSpy }],
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

    it('should handle error in ngAfterViewInit using errorHandler', () => {
        const errorMock = new Error('Test error');
        const errorHandlerSpy = jasmine.createSpyObj('ErrorHandler', ['handleError']);
        component['errorHandler'] = errorHandlerSpy;
        Object.defineProperty(modalMessageSpy, 'message$', {
            get: () =>
                new Observable((subscriber) => {
                    subscriber.error(errorMock);
                }),
        });
        component.ngAfterViewInit();
        expect(errorHandlerSpy.handleError).toHaveBeenCalledWith(errorMock);
    });

    it('should emit user input and close dialog when input is valid', () => {
        spyOn(component, 'isInputValid').and.returnValue(true);
        spyOn(component, 'onClose');
        component.userInput = 'Valid Input';
        component.onSubmit();
        expect(modalMessageSpy.emitUserInput).toHaveBeenCalledWith('Valid Input');
        expect(component.onClose).toHaveBeenCalled();
    });

    it('should return false for empty input', () => {
        component.userInput = '';
        expect(component.isInputValid()).toBeFalse();
    });

    it('should return false for input exceeding MAX_MAP_NAME_LENGTH', () => {
        component.userInput = 'A'.repeat(MAX_MAP_NAME_LENGTH + 1);
        expect(component.isInputValid()).toBeFalse();
    });

    it('should not call onSubmit when Enter key is pressed and input is invalid', () => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        spyOn(component, 'isInputValid').and.returnValue(false);
        spyOn(component, 'onSubmit');
        spyOn(mockEvent, 'preventDefault');
        component.userInput = '';
        component.onKeyDown(mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(component.onSubmit).not.toHaveBeenCalled();
    });

    it('should call onSubmit when Enter key is pressed and input is valid', () => {
        const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        spyOn(component, 'isInputValid').and.returnValue(true);
        spyOn(component, 'onSubmit');
        spyOn(mockEvent, 'preventDefault');
        component.userInput = 'Valid Input';
        component.onKeyDown(mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(component.onSubmit).toHaveBeenCalled();
    });
});
