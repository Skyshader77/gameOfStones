import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode, MapSize } from '@app/interfaces/map';

export const validateGameMode: ValidatorFn = (control: AbstractControl) => {
    const validModes = Object.values(GameMode);
    return validModes.includes(control.value) ? null : { invalidMode: true };
};

export const validateMapSize: ValidatorFn = (control: AbstractControl) => {
    const validSizes = Object.values(MapSize);
    return validSizes.includes(control.value) ? null : { invalidSize: true };
};

@Component({
    selector: 'app-map-creation-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './map-creation-form.component.html',
})
export class MapCreationFormComponent {
    @Output() submissionEvent = new EventEmitter<void>();
    @Output() cancelEvent = new EventEmitter<void>();
    mapSelectionForm: FormGroup;

    gameMode = GameMode;
    mapSize = MapSize;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
    ) {
        this.mapSelectionForm = this.formBuilder.group({
            mode: [GameMode.NORMAL, [Validators.required, validateGameMode]],
            size: [MapSize.SMALL, [Validators.required, validateMapSize]],
        });
    }

    onSubmit(): void {
        if (this.mapSelectionForm.valid) {
            const formData = this.mapSelectionForm.value;
            this.router.navigate(['/edit'], {
                queryParams: { size: formData.size, mode: formData.mode },
            });
        }
    }
    onCancel() {
        this.mapSelectionForm.reset({
            mode: GameMode.NORMAL,
            size: MapSize.SMALL,
        });
        this.cancelEvent.emit();
    }
}
