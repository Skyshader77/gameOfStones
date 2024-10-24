import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-room-page',
    standalone: true,
    templateUrl: './room-page.component.html',
    styleUrls: [],
    imports: [RouterLink, CommonModule, FontAwesomeModule, PlayerListComponent],
})
export class RoomPageComponent implements OnInit {
    roomId: string;
    isRoomLocked: boolean = false;
    faLockIcon = faLock;
    faOpenLockIcon = faLockOpen;

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
        }
    }

    toggleRoomLock() {
        this.isRoomLocked = !this.isRoomLocked;
        this.roomSocketService.toggleRoomLock(this.roomId);
    }
}
