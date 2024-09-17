import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faDiceFour, faDiceSix, faHandFist, faHeart, faPlay, faShieldHalved, faSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-player-creation',
    standalone: true,
    imports: [ReactiveFormsModule, FontAwesomeModule],
    templateUrl: './player-creation.component.html',
})
export class PlayerCreationComponent {
    @Output() submissionEvent = new EventEmitter();
    faHeart = faHeart;
    faPlay = faPlay;
    faHandFist = faHandFist;
    faShieldHalved = faShieldHalved;

    faCircleInfo = faCircleInfo;
    faDiceSix = faDiceSix;
    faDiceFour = faDiceFour;
    faSquare = faSquare;

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

        this.avatars = ['assets/avatar/deer.jpg', 'assets/avatar/frog.jpg', 'assets/avatar/goat.jpg', 'assets/avatar/knight.jpg'];
        const MAX_ATTRIBUTE = 6;
        this.placeHolder = Array.from({ length: MAX_ATTRIBUTE }, (_, i) => i);
    }

    setAvatar(avatarId: number): void {
        this.playerForm.get('avatarId')?.setValue(avatarId);
    }

    onSubmit(): void {
        this.submissionEvent.emit();
    }
}
