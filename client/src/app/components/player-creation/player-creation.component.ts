import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvatarListComponent } from '@app/components/avatar-list/avatar-list.component';
import { HpSpeedSelectorComponent } from '@app/components/hp-speed-selector/hp-speed-selector.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faDiceFour, faDiceSix, faHandFist, faHeart, faPlay, faShieldHalved, faSquare } from '@fortawesome/free-solid-svg-icons';
import { AttackDefenseSelectorComponent } from '../attack-defense-selector/attack-defense-selector.component';

@Component({
    selector: 'app-player-creation',
    standalone: true,
    imports: [ReactiveFormsModule, FontAwesomeModule, AvatarListComponent, HpSpeedSelectorComponent, AttackDefenseSelectorComponent],
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

    //   TODO for integration with dev:
    //   - change placeholder to something that is actually meaningful
    //   - make a constant for the default stats
    //   - make components for various parts of the form (avatar, stats)
    constructor() {
        this.playerForm = new FormGroup({
            name: new FormControl('', Validators.required),
            avatarId: new FormControl(0, Validators.required),
            statsBonus: new FormControl('', Validators.required),
            dice6: new FormControl('', Validators.required),
        });
        this.avatars = [
            'assets/avatar/goat.jpg',
            'assets/avatar/knight.jpg',
            'assets/avatar/Aishula.png',
            'assets/avatar/Claradore.png',
            'assets/avatar/Eugeny.jpg',
            'assets/avatar/Gwuine.png',
            'assets/avatar/Hardrakka.png',
            'assets/avatar/Livia.png',
            'assets/avatar/Sassan.png',
            'assets/avatar/The_Creator.png',
            'assets/avatar/Vakkon.png',
            'assets/avatar/Hood.png',
        ];
        const MAX_ATTRIBUTE = 6;
        this.placeHolder = Array.from({ length: MAX_ATTRIBUTE }, (_, i) => i);
    }

    getFormControl(controlName: string): FormControl {
        return this.playerForm.get(controlName) as FormControl;
    }

    onSubmit(): void {
        this.submissionEvent.emit();
    }
}
