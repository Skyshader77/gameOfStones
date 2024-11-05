import { Component } from '@angular/core';
import { AVATAR_PROFILE } from '@app/constants/player.constants';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';

@Component({
    selector: 'app-game-info',
    standalone: true,
    imports: [],
    templateUrl: './game-info.component.html',
})
export class GameInfoComponent {
    private avatarSrc = AVATAR_PROFILE;

    constructor(
        private gameMapService: GameMapService,
        private playerListService: PlayerListService,
    ) {}

    get mapSize() {
        return this.gameMapService.getMapSize() + ' x ' + this.gameMapService.getMapSize();
    }

    get playerCount() {
        return this.playerListService.getPlayerListCount();
    }

    get currentPlayer() {
        return this.playerListService.currentPlayerName;
    }

    get currentProfile() {
        const currentPlayer = this.playerListService.getCurrentPlayer();
        if (!currentPlayer) return '';
        return this.avatarSrc[currentPlayer.playerInfo.avatar];
    }
}
