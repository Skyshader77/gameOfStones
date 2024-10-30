import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { ModalMessage } from '@app/interfaces/modal-message';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-message-dialog',
    standalone: true,
    imports: [],
    templateUrl: './message-dialog.component.html',
})
export class MessageDialogComponent implements AfterViewInit, OnDestroy {
    @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement>;
    @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();
    message: ModalMessage = { title: '', content: '' };

    private subscription: Subscription;

    constructor(
        private modalMessageService: ModalMessageService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngAfterViewInit() {
        this.subscription = this.modalMessageService.message$.subscribe((newMessage: ModalMessage) => {
            this.message = newMessage;
            this.changeDetectorRef.detectChanges();
            if (this.dialog.nativeElement.isConnected) {
                this.dialog.nativeElement.showModal();
            }
        });
    }

    resetMessage() {
        this.message = { title: '', content: '' };
        this.modalMessageService.setMessage({ title: '', content: '' });
    }

    onClose() {
        this.resetMessage();
        this.closeEvent.emit();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
