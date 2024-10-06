import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ErrorMessage } from '@app/interfaces/error';
import { ErrorMessageService } from '@app/services/utilitary/error-message.service';

@Component({
    selector: 'app-error-dialog',
    standalone: true,
    imports: [],
    templateUrl: './error-dialog.component.html',
})
export class ErrorDialogComponent implements AfterViewInit {
    @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement>;
    message: ErrorMessage = { title: '', content: '' };

    constructor(private errorMessageService: ErrorMessageService) {}

    ngAfterViewInit() {
        this.errorMessageService.message$.subscribe((newMessage: ErrorMessage | null) => {
            if (newMessage) {
                this.message = newMessage;
                if (this.dialog.nativeElement.isConnected) {
                    this.dialog.nativeElement.showModal();
                }
            }
        });
    }

    onClose() {
        this.errorMessageService.reset();
    }
}
