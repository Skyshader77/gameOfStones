import { Component, OnDestroy, OnInit } from '@angular/core';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { PlayerRole } from '@common/constants/player.constants';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-player-list',
    standalone: true,
    imports: [],
    templateUrl: './game-player-list.component.html',
})
export class GamePlayerListComponent implements OnInit, OnDestroy {
    playerRole = PlayerRole;

    private playerListSubscription: Subscription;
    private playerAddedSubscription: Subscription;
    private playerRemovedSubscription: Subscription;
    private roomClosedSubscription: Subscription;

    constructor(
        protected playerListService: PlayerListService,
        public myPlayerService: MyPlayerService,
    ) {}

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
