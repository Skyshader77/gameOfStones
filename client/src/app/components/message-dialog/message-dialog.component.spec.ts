import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageDialogComponent } from './message-dialog.component';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { of } from 'rxjs';
import { MOCK_ERROR_MESSAGE } from '@app/constants/tests.constants';

describe('MessageDialogComponent', () => {
    let component: MessageDialogComponent;
    let errorMessageSpy: jasmine.SpyObj<ModalMessageService>;
    let fixture: ComponentFixture<MessageDialogComponent>;

    beforeEach(async () => {
        errorMessageSpy = jasmine.createSpyObj('ModalMessageService', ['reset'], {
            message$: of(null),
        });
        await TestBed.configureTestingModule({
            imports: [MessageDialogComponent],
            providers: [{ provide: ModalMessageService, useValue: errorMessageSpy }],
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

    it('should emit event on close', () => {
        spyOn(component.closeEvent, 'emit');
        component.onClose();
        expect(component.closeEvent.emit).toHaveBeenCalled();
    });
});
