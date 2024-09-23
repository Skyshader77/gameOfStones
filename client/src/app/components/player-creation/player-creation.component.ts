import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AvatarListComponent } from '@app/components/avatar-list/avatar-list.component';
import { StatsSelectorComponent } from '@app/components/stats-selector/stats-selector.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faDiceFour, faDiceSix, faHandFist, faHeart, faPlay, faShieldHalved, faSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-player-creation',
    standalone: true,
    imports: [ReactiveFormsModule, FontAwesomeModule, AvatarListComponent, StatsSelectorComponent],
    templateUrl: './player-creation.component.html',
})
export class PlayerCreationComponent {
    @Output() submissionEvent = new EventEmitter();

    faPlay = faPlay;
    faHeart = faHeart;
    faSquare = faSquare;
    faDiceSix = faDiceSix;
    faDiceFour = faDiceFour;
    faHandFist = faHandFist;
    faCircleInfo = faCircleInfo;
    faShieldHalved = faShieldHalved;

    avatars: string[];
    placeHolder: number[];
    playerForm: FormGroup;

    constructor() {
        this.playerForm = new FormGroup({
            name: new FormControl('', [this.isNameValid()]),
            avatarId: new FormControl(0, Validators.required),
            statsBonus: new FormControl('', Validators.required),
            dice6: new FormControl('', Validators.required),
        });
    }

    isNameValid(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value: string = control.value.trim();
            if (value.length === 0 || value.length > 20) return { invalid: true };
            return null;
        };
    }

    getFormControl(controlName: string): FormControl {
        return this.playerForm.get(controlName) as FormControl;
    }

    onSubmit(): void {
        this.submissionEvent.emit();
        this.playerForm.reset();
    }
}
