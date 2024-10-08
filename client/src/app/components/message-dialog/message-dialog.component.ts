import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalMessage } from '@app/interfaces/modal-message';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';

@Component({
    selector: 'app-message-dialog',
    standalone: true,
    imports: [],
    templateUrl: './message-dialog.component.html',
})
export class MessageDialogComponent implements AfterViewInit {
    @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement>;
    @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();
    message: ModalMessage = { title: '', content: '' };

    constructor(private errorMessageService: ModalMessageService) {}

    ngAfterViewInit() {
        this.errorMessageService.message$.subscribe((newMessage: ModalMessage) => {
            if (newMessage) {
                this.message = newMessage;
                if (this.dialog.nativeElement.isConnected) {
                    this.dialog.nativeElement.showModal();
                }
            }
        });
    }

    onClose() {
        this.closeEvent.emit();
    }
}
