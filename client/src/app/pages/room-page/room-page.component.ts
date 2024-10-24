import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { RoomStateService } from '@app/services/room-services/room-state.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-room-page',
    standalone: true,
    templateUrl: './room-page.component.html',
    styleUrls: [],
    imports: [RouterLink, CommonModule, FontAwesomeModule, PlayerListComponent, ChatComponent],
})
export class RoomPageComponent implements OnInit, OnDestroy {
    roomId: string;
    isRoomLocked: boolean = false;
    faLockIcon = faLock;
    faOpenLockIcon = faLockOpen;

    myPlayerService: MyPlayerService = inject(MyPlayerService);
    roomStateService: RoomStateService = inject(RoomStateService);
    private playerListSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private playerListService: PlayerListService,
        private refreshService: RefreshService,
        private roomSocketService: RoomSocketService,
        private routerService: Router,
    ) {}

    ngOnInit() {
        if (this.refreshService.wasRefreshed()) {
            // TODO set an error message!
            this.routerService.navigate(['/init']);
        }
        this.roomId = this.route.snapshot.paramMap.get('id') || '';
        if (this.roomId) {
            this.playerListService.fetchPlayers(this.roomId);
            this.playerListSubscription = this.playerListService.listenPlayerList();
        }
        this.roomStateService.initialize();
    }

    toggleRoomLock() {
        this.isRoomLocked = !this.isRoomLocked;
        this.roomSocketService.toggleRoomLock(this.roomId);
    }

    quitRoom() {
        // TODO place this in another service
        this.roomSocketService.leaveRoom();
        this.routerService.navigate(['/init']);
    }

    ngOnDestroy(): void {
        this.playerListSubscription.unsubscribe();
        this.roomStateService.onCleanUp();
    }
}
