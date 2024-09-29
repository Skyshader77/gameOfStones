import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AvatarListComponent } from '@app/components/avatar-list/avatar-list.component';
import { StatsSelectorComponent } from '@app/components/stats-selector/stats-selector.component';
import { AVATARS, INITIAL_PLAYER_FORM_VALUES, MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/constants/player.constants';
import { Statistic } from '@app/interfaces/stats';

@Component({
    selector: 'app-player-creation',
    standalone: true,
    imports: [ReactiveFormsModule, AvatarListComponent, StatsSelectorComponent],
    templateUrl: './player-creation.component.html',
})
export class PlayerCreationComponent {
    @Output() submissionEvent = new EventEmitter();

    playerForm: FormGroup;

    constructor() {
        this.playerForm = this.createFormGroup();
    }

    getFormControl(controlName: string): FormControl {
        return this.playerForm.get(controlName) as FormControl;
    }

    onSubmit(): void {
        this.submissionEvent.emit();
        this.playerForm.reset(INITIAL_PLAYER_FORM_VALUES);
    }

    private createFormGroup(): FormGroup {
        return new FormGroup({
            name: new FormControl(INITIAL_PLAYER_FORM_VALUES.name, this.isNameValid()),
            avatarId: new FormControl(INITIAL_PLAYER_FORM_VALUES.avatarId, this.isAvatarIdValid()),
            statsBonus: new FormControl(INITIAL_PLAYER_FORM_VALUES.statsBonus, [this.isInList([Statistic.HP, Statistic.SPEED])]),
            dice6: new FormControl(INITIAL_PLAYER_FORM_VALUES.dice6, [this.isInList([Statistic.ATTACK, Statistic.DEFENSE])]),
        });
    }

    private isAvatarIdValid(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null =>
            control.value < 0 || control.value >= AVATARS.length ? { invalid: true } : null;
    }

    private isNameValid(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value.trim();
            const regex = /^[a-zA-Z0-9 ]*$/;
            return value.length < MIN_NAME_LENGTH || value.length > MAX_NAME_LENGTH || !regex.test(value) ? { invalid: true } : null;
        };
    }

    private isInList(validValues: string[]): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => (validValues.includes(control.value.trim()) ? null : { invalid: true });
    }
}
