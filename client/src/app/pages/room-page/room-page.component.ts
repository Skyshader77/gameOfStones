import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-room-page',
    standalone: true,
    templateUrl: './room-page.component.html',
    styleUrls: [],
    imports: [RouterLink, CommonModule, FontAwesomeModule, PlayerListComponent],
})
export class RoomPageComponent implements OnInit, OnDestroy {
    roomId: string;
    isRoomLocked: boolean = false;
    faLockIcon = faLock;
    faOpenLockIcon = faLockOpen;

    private gameStartSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private playerListService: PlayerListService,
        public gameLogicSocketService: GameLogicSocketService,
        private refreshService: RefreshService,
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
            this.gameStartSubscription = this.gameLogicSocketService.listenToStartGame();
        }
    }

    toggleRoomLock() {
        this.isRoomLocked = !this.isRoomLocked;
        // TODO emit
    }

    ngOnDestroy(): void {
        this.gameStartSubscription.unsubscribe();
    }
}
