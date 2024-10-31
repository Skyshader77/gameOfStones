import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionModalComponent } from './decision-modal.component';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { of } from 'rxjs';
import { MOCK_MODAL_MESSAGE } from '@app/constants/tests.constants';

describe('MessageDialogComponent', () => {
    let component: DecisionModalComponent;
    let modalMessageSpy: jasmine.SpyObj<ModalMessageService>;
    let fixture: ComponentFixture<DecisionModalComponent>;

    beforeEach(async () => {
        modalMessageSpy = jasmine.createSpyObj('ModalMessageService', ['setMessage', 'getStoredMessage'], {
            message$: of(),
        });
        await TestBed.configureTestingModule({
            imports: [DecisionModalComponent],
            providers: [{ provide: ModalMessageService, useValue: modalMessageSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(DecisionModalComponent);
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
});
