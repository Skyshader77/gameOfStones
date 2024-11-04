import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AvatarListComponent } from '@app/components/avatar-list/avatar-list.component';
import { StatsSelectorComponent } from '@app/components/stats-selector/stats-selector.component';
import { AVATAR_PROFILE, INITIAL_PLAYER_FORM_VALUES } from '@app/constants/player.constants';
import { MAX_NAME_LENGTH } from '@app/constants/validation.constants';
import { PlayerCreationForm } from '@app/interfaces/player-creation-form';
import { PlayerAttributeType } from '@app/interfaces/stats';

@Component({
    selector: 'app-player-creation',
    standalone: true,
    imports: [ReactiveFormsModule, AvatarListComponent, StatsSelectorComponent],
    templateUrl: './player-creation.component.html',
})
export class PlayerCreationComponent {
    @Output() submissionEvent = new EventEmitter<PlayerCreationForm>();
    @Output() closeEvent = new EventEmitter();
    playerForm: FormGroup;
    maxNameLength = MAX_NAME_LENGTH;

    constructor() {
        this.playerForm = this.createFormGroup();
    }

    getFormControl(controlName: string): FormControl {
        return this.playerForm.get(controlName) as FormControl;
    }

    onSubmit(): void {
        const formData = {
            name: this.playerForm.value.name,
            avatarId: this.playerForm.value.avatarId,
            statsBonus: this.playerForm.value.statsBonus,
            dice6: this.playerForm.value.dice6,
        };
        this.submissionEvent.emit(formData);
        this.playerForm.reset(INITIAL_PLAYER_FORM_VALUES);
    }

    onClose() {
        this.closeEvent.emit();
    }

    private createFormGroup(): FormGroup {
        return new FormGroup({
            name: new FormControl(INITIAL_PLAYER_FORM_VALUES.name, this.isNameValid()),
            avatarId: new FormControl(INITIAL_PLAYER_FORM_VALUES.avatarId, this.isAvatarIdValid()),
            statsBonus: new FormControl(INITIAL_PLAYER_FORM_VALUES.statsBonus, [this.isInList([PlayerAttributeType.Hp, PlayerAttributeType.Speed])]),
            dice6: new FormControl(INITIAL_PLAYER_FORM_VALUES.dice6, [this.isInList([PlayerAttributeType.Attack, PlayerAttributeType.Defense])]),
        });
    }

    private isAvatarIdValid(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null =>
            control.value < 0 || control.value >= Object.keys(AVATAR_PROFILE).length ? { invalid: true } : null;
    }

    private isNameValid(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value.trim();
            const regex = /^[a-zA-Z0-9 ]*$/;
            return value.length <= 0 || value.length > MAX_NAME_LENGTH || !regex.test(value) ? { invalid: true } : null;
        };
    }

    private isInList(validValues: string[]): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => (validValues.includes(control.value.trim()) ? null : { invalid: true });
    }
}
