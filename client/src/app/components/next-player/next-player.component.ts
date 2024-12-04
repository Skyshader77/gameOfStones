import { Component } from '@angular/core';
import { AVATAR_PROFILE } from '@app/constants/assets.constants';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';

@Component({
    selector: 'app-next-player',
    standalone: true,
    imports: [],
    templateUrl: './next-player.component.html',
})
export class NextPlayerComponent {
    private avatarSrc = AVATAR_PROFILE;

    constructor(
        private playerListService: PlayerListService,
        private myPlayerService: MyPlayerService,
    ) {}

    get myName() {
        return this.myPlayerService.getUserName();
    }

    get nextPlayerName(): string | undefined {
        return this.playerListService.getCurrentPlayer()?.playerInfo.userName;
    }

    get nextPlayerAvatar(): string {
        const currentPlayer = this.playerListService.getCurrentPlayer();
        if (!currentPlayer) return '';
        return this.avatarSrc[currentPlayer.playerInfo.avatar];
    }
}
