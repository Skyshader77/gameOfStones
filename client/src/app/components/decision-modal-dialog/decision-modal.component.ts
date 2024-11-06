import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { ModalMessage } from '@app/interfaces/modal-message';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-decision-modal',
    standalone: true,
    imports: [],
    templateUrl: './decision-modal.component.html',
})
export class DecisionModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement>;
    @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output() acceptEvent: EventEmitter<void> = new EventEmitter<void>();
    message: ModalMessage | null = null;

    private subscription: Subscription;

    constructor(private modalMessageService: ModalMessageService) {}

    get isOpen(): boolean {
        return this.dialog.nativeElement.open;
    }

    ngAfterViewInit() {
        this.subscription = this.modalMessageService.decisionMessage$.subscribe((newMessage: ModalMessage) => {
            this.message = newMessage;
            if (this.dialog.nativeElement.isConnected) {
                this.dialog.nativeElement.showModal();
                this.preventKeyboardInteractions(true);
            }
        });
    }

    closeDialog() {
        this.dialog.nativeElement.close();
        this.preventKeyboardInteractions(false);
    }

    onClose() {
        this.dialog.nativeElement.close();
        this.closeEvent.emit();
        this.preventKeyboardInteractions(false);
    }

    onAccept() {
        this.acceptEvent.emit();
    }

    preventKeyboardInteractions(enable: boolean) {
        if (enable) {
            document.addEventListener('keydown', this.blockKeyboardShortcuts);
        } else {
            document.removeEventListener('keydown', this.blockKeyboardShortcuts);
        }
    }

    blockKeyboardShortcuts(event: KeyboardEvent) {
        event.preventDefault();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.preventKeyboardInteractions(false);
    }
}
