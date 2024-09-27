import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AvatarListComponent } from '@app/components/avatar-list/avatar-list.component';
import { StatsSelectorComponent } from '@app/components/stats-selector/stats-selector.component';
import { AVATARS, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/constants/player.constants';
import { Statistic } from '@app/interfaces/stats';

@Component({
    selector: 'app-player-creation',
    standalone: true,
    imports: [ReactiveFormsModule, AvatarListComponent, StatsSelectorComponent],
    templateUrl: './player-creation.component.html',
})
export class PlayerCreationComponent {
    @Output() submissionEvent = new EventEmitter();

    avatars: string[];
    playerForm: FormGroup;

    constructor() {
        this.playerForm = this.createFormGroup();
    }

    getFormControl(controlName: string): FormControl {
        return this.playerForm.get(controlName) as FormControl;
    }

    onSubmit(): void {
        this.submissionEvent.emit();
        this.playerForm.reset();
    }

    private createFormGroup(): FormGroup {
        return new FormGroup({
            name: new FormControl('', this.isNameValid()),
            avatarId: new FormControl(0, this.isAvatarIdValid()),
            statsBonus: new FormControl('', [this.isInList([Statistic.HP, Statistic.SPEED])]),
            dice6: new FormControl('', [this.isInList([Statistic.ATTACK, Statistic.DEFENSE])]),
        });
    }

    private isInList(validValues: string[]): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value.trim();
            return validValues.includes(value) ? null : { invalid: true };
        };
    }

    private isNameValid(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value.trim();
            const regex = /^[a-zA-Z0-9 ]*$/; // Matches letters, numbers and spaces
            return value.length < MIN_NAME_LENGTH || value.length > MAX_NAME_LENGTH || !regex.test(value) ? { invalid: true } : null;
        };
    }

    private isAvatarIdValid(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            return value < 0 || value >= AVATARS.length ? { invalid: true } : null;
        };
    }
}
