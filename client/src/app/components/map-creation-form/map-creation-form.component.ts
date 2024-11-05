import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GAME_MODES, MAP_SIZES } from '@app/constants/admin.constants';
import { GameMode } from '@common/enums/game-mode.enum';
import { MapSize } from '@common/enums/map-size.enum';

export function validateIsEnum(enumObj: typeof GameMode | typeof MapSize): ValidatorFn {
    return (control: AbstractControl) => {
        const validValues = Object.values(enumObj);
        return validValues.includes(control.value) ? null : { invalid: true };
    };
}

@Component({
    selector: 'app-map-creation-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './map-creation-form.component.html',
})
export class MapCreationFormComponent {
    @Output() cancelEvent = new EventEmitter<void>();

    mapSelectionForm: FormGroup;

    gameModes = GAME_MODES;
    mapSizes = MAP_SIZES;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
    ) {
        this.mapSelectionForm = this.formBuilder.group({
            mode: [GameMode.Normal, [Validators.required, validateIsEnum(GameMode)]],
            size: [MapSize.Small, [Validators.required, validateIsEnum(MapSize)]],
        });
    }

    onSubmit(event: Event): void {
        event.preventDefault();
        if (this.mapSelectionForm.valid) {
            const formData = this.mapSelectionForm.value;
            this.router.navigate(['/edit'], {
                queryParams: { size: formData.size, mode: formData.mode },
            });
        }
    }

    onCancel() {
        this.mapSelectionForm.reset({
            mode: GameMode.Normal,
            size: MapSize.Small,
        });
        this.cancelEvent.emit();
    }
}
