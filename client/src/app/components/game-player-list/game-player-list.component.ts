import { Component, OnDestroy, OnInit } from '@angular/core';
import { AVATAR_PROFILE } from '@app/constants/player.constants';
import { PlayerListService } from '@app/services/room-services/player-list/player-list.service';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';

@Component({
    selector: 'app-game-player-list',
    standalone: true,
    imports: [],
    templateUrl: './game-player-list.component.html',
})
export class GamePlayerListComponent implements OnInit, OnDestroy {
    playerRole = PlayerRole;
    private avatarSrc = AVATAR_PROFILE;

    constructor(private playerListService: PlayerListService) {}

    get playerList() {
        return this.playerListService.playerList;
    }

    getAvatarImage(avatar: Avatar) {
        return this.avatarSrc[avatar];
    }

    isCurrentPlayer(playerName: string): boolean {
        return playerName === this.playerListService.currentPlayerName;
    }

    ngOnInit(): void {
        this.playerListService.initialize();
    }

    ngOnDestroy(): void {
        this.playerListService.cleanup();
    }
}
