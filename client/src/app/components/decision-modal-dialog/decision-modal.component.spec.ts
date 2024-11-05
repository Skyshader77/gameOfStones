import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionModalComponent } from './decision-modal.component';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { Subject } from 'rxjs';
import { ElementRef } from '@angular/core';
import { ModalMessage } from '@app/interfaces/modal-message';

describe('DecisionModalComponent', () => {
    let component: DecisionModalComponent;
    let fixture: ComponentFixture<DecisionModalComponent>;
    let modalMessageService: jasmine.SpyObj<ModalMessageService>;
    let decisionMessageSubject: Subject<ModalMessage>;

    beforeEach(async () => {
        decisionMessageSubject = new Subject<ModalMessage>(); // Create a new Subject
        modalMessageService = jasmine.createSpyObj('ModalMessageService', ['decisionMessage$'], {
            decisionMessage$: decisionMessageSubject.asObservable(), // Expose it as an Observable
        });

        await TestBed.configureTestingModule({
            imports: [DecisionModalComponent],
            providers: [{ provide: ModalMessageService, useValue: modalMessageService }],
        }).compileComponents();

        fixture = TestBed.createComponent(DecisionModalComponent);
        component = fixture.componentInstance;

        // Mock dialog element with spies
        const dialogElement = jasmine.createSpyObj('HTMLDialogElement', ['showModal', 'close']);
        dialogElement.open = false; // Initialize open property
        dialogElement.isConnected = true; // Mock isConnected property

        // Assign dialog element to the component
        component.dialog = new ElementRef(dialogElement);

        // Trigger initial change detection
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with a null message', () => {
        expect(component.message).toBeNull();
    });

    it('should subscribe to modal messages and show the modal when a message is received', async () => {
        component.ngAfterViewInit(); // Ensure ngAfterViewInit is called first

        const newMessage: ModalMessage = { title: 'Confirm', content: 'Are you sure?' };
        decisionMessageSubject.next(newMessage); // Emit a new message using Subject

        await fixture.whenStable(); // Wait for Angular's change detection
        fixture.detectChanges(); // Run change detection after message emission

        expect(component.message).toEqual(newMessage);
    });

    it('should call close on the dialog and emit closeEvent when onClose is called', () => {
        spyOn(component.closeEvent, 'emit');

        component.onClose();

        expect(component.closeEvent.emit).toHaveBeenCalled();
    });

    it('should return false when dialog is undefined', () => {
        component.dialog = new ElementRef({ open: false } as unknown as HTMLDialogElement);
        expect(component.isOpen).toBeFalse();
    });

    it('should return true when dialog is open', () => {
        component.dialog.nativeElement.open = true; // Set the open property to true
        expect(component.isOpen).toBeTrue(); // Check that isOpen returns true
    });

    it('should close the dialog and emit closeEvent on closeDialog', () => {
        spyOn(component.closeEvent, 'emit'); // Spy on closeEvent emitter
        const closeSpy = spyOn(component.dialog.nativeElement, 'close'); // Spy on the close method

        component.closeDialog();

        expect(closeSpy).toHaveBeenCalled(); // Check if close was called
    });

    it('should emit acceptEvent on onAccept', () => {
        spyOn(component.acceptEvent, 'emit');

        component.onAccept();

        expect(component.acceptEvent.emit).toHaveBeenCalled(); // Check if acceptEvent was emitted
    });

    it('should unsubscribe on ngOnDestroy', () => {
        component.ngAfterViewInit(); // Initialize subscription first
        const unsubscribeSpy = spyOn(component['subscription'], 'unsubscribe').and.callThrough();

        component.ngOnDestroy();

        expect(unsubscribeSpy).toHaveBeenCalled(); // Ensure unsubscribe was called
    });
});
