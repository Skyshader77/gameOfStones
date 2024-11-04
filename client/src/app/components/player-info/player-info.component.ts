import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AVATAR_PROFILE } from '@app/constants/player.constants';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

@Component({
    selector: 'app-player-info',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './player-info.component.html',
    styleUrls: [],
})
export class PlayerInfoComponent {
    private avatarSrc = AVATAR_PROFILE;
    constructor(private myPlayerService: MyPlayerService) {}

    get myName() {
        return this.myPlayerService.getUserName();
    }

    get myAvatarSrc() {
        return this.avatarSrc[this.myPlayerService.getAvatar()];
    }

    get myHp() {
        return this.myPlayerService.getRemainingHp() + ' / ' + this.myPlayerService.getMaxHp();
    }

    get myMovement() {
        return this.myPlayerService.getRemainingMovement() + ' / ' + this.myPlayerService.getSpeed();
    }

    get mySpeed() {
        return this.myPlayerService.getSpeed();
    }

    get myAttack() {
        return this.myPlayerService.getAttack();
    }

    get myDefense() {
        return this.myPlayerService.getDefense();
    }

    get myDies() {
        const dice = this.myPlayerService.getDice();
        return 'Attaque: ' + dice[0] + ', Défense: ' + dice[1];
    }

    get myActions() {
        return this.myPlayerService.getRemainingActions();
    }
}
