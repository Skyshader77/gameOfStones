import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode, MapSize } from '@app/interfaces/map';

export function validateIsEnum(enumObj: typeof GameMode | typeof MapSize): ValidatorFn {
    return (control: AbstractControl) => {
        const validValues = Object.values(enumObj);
        return validValues.includes(control.value) ? null : { invalid: true };
    };
}

@Component({
    selector: 'app-map-creation-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './map-creation-form.component.html',
})
export class MapCreationFormComponent {
    @Output() cancelEvent = new EventEmitter<void>();

    mapSelectionForm: FormGroup;

    gameMode = GameMode;
    mapSize = MapSize;

    gameModes = [
        { value: this.gameMode.NORMAL, label: 'Classique' },
        { value: this.gameMode.CTF, label: 'Capture du Drapeau' },
    ];
    mapSizes = [
        { value: this.mapSize.SMALL, label: '10 x 10' },
        { value: this.mapSize.MEDIUM, label: '15 x 15' },
        { value: this.mapSize.LARGE, label: '20 x 20' },
    ];

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
    ) {
        this.mapSelectionForm = this.formBuilder.group({
            mode: [GameMode.NORMAL, [Validators.required, validateIsEnum(GameMode)]],
            size: [MapSize.SMALL, [Validators.required, validateIsEnum(MapSize)]],
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
