import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AVATAR_PROFILE } from '@app/constants/assets.constants';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';

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
        const remainingHp = this.myPlayerService.getRemainingHp();
        const maxHp = this.myPlayerService.getMaxHp();
        return `❤️ ${remainingHp} / ${maxHp}`;
    }

    get myMovement() {
        const remainingMovement = this.myPlayerService.getRemainingMovement();
        const maxSpeed = this.myPlayerService.getSpeed();

        return `👣️ ${remainingMovement} / ${maxSpeed}`;
    }

    get mySpeed() {
        const speedValue = this.myPlayerService.getSpeed();
        return `⚡ ${speedValue}`;
    }

    get myAttack() {
        const attackValue = this.myPlayerService.getAttack();
        return `🗡️ ${attackValue}`;
    }

    get myDefense() {
        const defenseValue = this.myPlayerService.getDefense();
        return `🛡️ ${defenseValue}`;
    }

    get myDies() {
        const dice = this.myPlayerService.getDice();
        return `🎲 : ⚔️ ${dice[0]} 🛡️ ${dice[1]}`;
    }

    get myActions() {
        const remainingActions = this.myPlayerService.getRemainingActions();
        return `🖐️ ${remainingActions} / 1`;
    }
}
