import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faDiceFour, faDiceSix, faHandFist, faHeart, faPlay, faShieldHalved, faSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-player-creation',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule, FontAwesomeModule],
    templateUrl: './player-creation.component.html',
})
export class PlayerCreationComponent {
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

    routerService: Router = inject(Router);

    playerForm: FormGroup;

    constructor() {
        this.playerForm = new FormGroup({
            name: new FormControl('', Validators.required),
            avatarId: new FormControl(0, Validators.required),
            statsBonus: new FormControl('', Validators.required),
            dice6: new FormControl('', Validators.required),
        });

        this.avatars = ['assets/avatar/deer.jpg', 'assets/avatar/frog.jpg', 'assets/avatar/goat.jpg', 'assets/avatar/knight.jpg'];
        this.placeHolder = [0, 0, 0, 0, 0, 0];
    }

    setAvatar(avatarId: number): void {
        this.playerForm.get('avatarId')?.setValue(avatarId);
    }
}
