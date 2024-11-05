import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalMessage } from '@app/interfaces/modal-message';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { Subject } from 'rxjs';
import { DecisionModalComponent } from './decision-modal.component';

describe('DecisionModalComponent', () => {
    let component: DecisionModalComponent;
    let fixture: ComponentFixture<DecisionModalComponent>;
    let modalMessageService: jasmine.SpyObj<ModalMessageService>;
    let decisionMessageSubject: Subject<ModalMessage>;

    beforeEach(async () => {
        decisionMessageSubject = new Subject<ModalMessage>();
        modalMessageService = jasmine.createSpyObj('ModalMessageService', ['decisionMessage$'], {
            decisionMessage$: decisionMessageSubject.asObservable(),
        });

        await TestBed.configureTestingModule({
            imports: [DecisionModalComponent],
            providers: [{ provide: ModalMessageService, useValue: modalMessageService }],
        }).compileComponents();

        fixture = TestBed.createComponent(DecisionModalComponent);
        component = fixture.componentInstance;

        const dialogElement = jasmine.createSpyObj('HTMLDialogElement', ['showModal', 'close']);
        dialogElement.open = false;
        dialogElement.isConnected = true;

        component.dialog = new ElementRef(dialogElement);

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with a null message', () => {
        expect(component.message).toBeNull();
    });

    it('should subscribe to modal messages and show the modal when a message is received', async () => {
        component.ngAfterViewInit();

        const newMessage: ModalMessage = { title: 'Confirm', content: 'Are you sure?' };
        decisionMessageSubject.next(newMessage);

        await fixture.whenStable();
        fixture.detectChanges();

        expect(component.message).toEqual(newMessage);
        expect(component.dialog.nativeElement.open).toBeTrue();
    });

    it('should call close on the dialog and emit closeEvent when onClose is called', () => {
        spyOn(component.closeEvent, 'emit');
        const closeSpy = spyOn(component.dialog.nativeElement, 'close');

        component.onClose();

        expect(closeSpy).toHaveBeenCalled();
        expect(component.closeEvent.emit).toHaveBeenCalled();
    });

    it('should return false when dialog is undefined', () => {
        component.dialog = new ElementRef({ open: false } as unknown as HTMLDialogElement);
        expect(component.isOpen).toBeFalse();
    });

    it('should return true when dialog is open', () => {
        component.dialog.nativeElement.open = true;
        expect(component.isOpen).toBeTrue();
    });

    it('should close the dialog and emit closeEvent on closeDialog', () => {
        spyOn(component.closeEvent, 'emit');
        const closeSpy = spyOn(component.dialog.nativeElement, 'close');

        component.closeDialog();

        expect(closeSpy).toHaveBeenCalled();
    });

    it('should emit acceptEvent on onAccept', () => {
        spyOn(component.acceptEvent, 'emit');

        component.onAccept();

        expect(component.acceptEvent.emit).toHaveBeenCalled();
    });

    it('should unsubscribe on ngOnDestroy', () => {
        component.ngAfterViewInit();
        const unsubscribeSpy = spyOn(component['subscription'], 'unsubscribe').and.callThrough();

        component.ngOnDestroy();

        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should prevent keyboard interactions when modal is shown', async () => {
        const addEventListenerSpy = spyOn(document, 'addEventListener');

        component.ngAfterViewInit();

        decisionMessageSubject.next({ title: 'Test', content: 'Message' });
        await fixture.whenStable();
        fixture.detectChanges();

        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', component.blockKeyboardShortcuts);
    });

    it('should remove keyboard interactions when modal is closed', () => {
        const removeEventListenerSpy = spyOn(document, 'removeEventListener');

        component.closeDialog();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', component.blockKeyboardShortcuts);
    });

    it('should call preventDefault on keyboard event in blockKeyboardShortcuts', () => {
        const event = new KeyboardEvent('keydown');
        const preventDefaultSpy = spyOn(event, 'preventDefault');

        component.blockKeyboardShortcuts(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });
});
