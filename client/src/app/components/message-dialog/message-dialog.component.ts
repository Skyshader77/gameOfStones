import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAX_MAP_NAME_LENGTH } from '@app/constants/admin.constants';
import { ModalMessage } from '@app/interfaces/modal-message';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-message-dialog',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './message-dialog.component.html',
})
export class MessageDialogComponent implements AfterViewInit, OnDestroy {
    @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement>;
    @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();
    message: ModalMessage | null = null;
    userInput: string = '';

    private subscription: Subscription;

    constructor(
        private modalMessageService: ModalMessageService,
        private changeDetectorRef: ChangeDetectorRef,
        private errorHandler: ErrorHandler,
    ) {}

    ngAfterViewInit() {
        this.subscription = this.modalMessageService.message$.subscribe({
            next: (newMessage: ModalMessage) => {
                this.message = newMessage;
                this.userInput = '';
                this.changeDetectorRef.detectChanges();
                if (this.dialog?.nativeElement?.isConnected) {
                    this.dialog.nativeElement.showModal();
                }
            },
            error: (error) => {
                this.errorHandler.handleError(error);
            },
        });
    }

    resetMessage() {
        this.message = null;
        this.userInput = '';
        this.modalMessageService.clearMessage();
    }

    onClose() {
        this.resetMessage();
        this.closeEvent.emit();
    }

    onSubmit() {
        const trimmedInput = this.userInput.trim();
        if (this.isInputValid()) {
            this.modalMessageService.emitUserInput(trimmedInput);
            this.onClose();
        }
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    isInputValid(): boolean {
        const trimmedInput = this.userInput.trim();
        return trimmedInput.length >= 1 && trimmedInput.length <= MAX_MAP_NAME_LENGTH;
    }

    onKeyDown(event: Event) {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key === 'Enter') {
            event.preventDefault();
            if (this.isInputValid()) {
                this.onSubmit();
            }
        }
    }
}
