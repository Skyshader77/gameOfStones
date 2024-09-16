import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faDiceFour, faDiceSix, faShieldHalved } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-player-creation-page',
    standalone: true,
    templateUrl: './player-creation-page.component.html',
    styleUrls: ['./player-creation-page.component.scss'],
    imports: [RouterLink, ReactiveFormsModule, FontAwesomeModule, CommonModule],
})
export class PlayerCreationPageComponent implements OnInit {
    faCircleInfo = faCircleInfo;
    faDiceSix = faDiceSix;
    faDiceFour = faDiceFour;
    faShieldHalved = faShieldHalved;

    playerForm: FormGroup;
    selectedAvatar: string = '../../../assets/goat.jpg';

    selectedBonus: string | null = null;
    lifeHearts: boolean[] = [true, true, true, true, false, false];
    speedTriangles: boolean[] = [true, true, true, true, false, false];
    attackStars: boolean[] = [true, true, true, true];
    defenseHexagons: boolean[] = [true, true, true, true];

    constructor(
        private fb: FormBuilder,
        private router: Router,
    ) {
        this.playerForm = this.fb.group({
            name: [''],
            bonus: [''],
            d6Bonus: [],
        });
    }

    changeAvatar(avatar: string): void {
        this.selectedAvatar = avatar;
        this.playerForm.get('avatar')?.setValue(avatar);
    }

    updateBonus(selectedBonus: string): void {
        if (selectedBonus === 'life') {
            this.lifeHearts = [true, true, true, true, true, true];
            this.speedTriangles = [true, true, true, true, false, false];
        } else if (selectedBonus === 'speed') {
            this.speedTriangles = [true, true, true, true, true, true];
            this.lifeHearts = [true, true, true, true, false, false];
        }
    }

    onBonusChange(bonus: string): void {
        this.selectedBonus = bonus;
    }

    ngOnInit(): void {
        // Initialisation si nécessaire
    }

    onSubmit() {
        if (this.playerForm.valid) {
            // Envoyer les données au serveur ou via websocket
            this.router.navigateByUrl('/lobby');
        }
    }
}
