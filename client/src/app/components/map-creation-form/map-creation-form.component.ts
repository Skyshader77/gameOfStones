import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
    selector: 'app-map-creation-form',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './map-creation-form.component.html',
})
export class MapCreationFormComponent {
    @Output() submissionEvent = new EventEmitter<void>();
    @Output() cancelEvent = new EventEmitter<void>();
    mapSelectionForm: FormGroup;
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
    ) {
        this.mapSelectionForm = this.formBuilder.group({
            mode: ['classic', Validators.required],
            size: ['10x10', Validators.required],
        });
    }
    onSubmit(): void {
        if (this.mapSelectionForm.valid) {
            const formData = this.mapSelectionForm.value;
            this.router.navigate(['/edit'], { state: { data: formData } });
        }
    }
    onCancel() {
        this.mapSelectionForm.reset({
            mode: 'classic',
            size: '10x10',
        });
        this.cancelEvent.emit();
    }
}
