import { Component, Input } from '@angular/core';
@Component({
    selector: 'app-standard-message-dialogbox',
    standalone: true,
    imports: [],
    templateUrl: './standard-message-dialogbox.component.html',
})
export class StandardMessageDialogboxComponent {
    @Input() title: string = 'Default Title';
    @Input() content: string = 'Default content goes here.';
    @Input() isConfirmationForm: boolean = false;
}
