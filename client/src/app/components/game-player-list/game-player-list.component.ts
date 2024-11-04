import { Component, OnDestroy, OnInit } from '@angular/core';
import { AVATAR_PROFILE } from '@app/constants/player.constants';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';

import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-player-list',
    standalone: true,
    imports: [],
    templateUrl: './game-player-list.component.html',
})
export class GamePlayerListComponent implements OnInit, OnDestroy {
    playerRole = PlayerRole;
    private avatarSrc = AVATAR_PROFILE;

    private playerListSubscription: Subscription;
    private playerAddedSubscription: Subscription;
    private playerRemovedSubscription: Subscription;
    private roomClosedSubscription: Subscription;

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
        this.playerListSubscription = this.playerListService.listenPlayerListUpdated();
        this.playerAddedSubscription = this.playerListService.listenPlayerAdded();
        this.playerRemovedSubscription = this.playerListService.listenPlayerRemoved();
        this.roomClosedSubscription = this.playerListService.listenRoomClosed();
    }

    ngOnDestroy(): void {
        this.playerListSubscription.unsubscribe();
        this.playerAddedSubscription.unsubscribe();
        this.playerRemovedSubscription.unsubscribe();
        this.roomClosedSubscription.unsubscribe();
    }
}
