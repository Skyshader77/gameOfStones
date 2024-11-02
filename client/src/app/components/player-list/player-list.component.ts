import { Component, OnDestroy, OnInit } from '@angular/core';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { Subscription } from 'rxjs';
import { AVATARS } from '@app/constants/player.constants';

@Component({
    selector: 'app-player-list',
    standalone: true,
    imports: [],
    templateUrl: './player-list.component.html',
    styleUrls: [],
})
export class PlayerListComponent implements OnInit, OnDestroy {
    avatars = AVATARS;
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
