import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { PlayerListService } from '@app/services/room-services/player-list.service';
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
    ) {}

    ngOnInit() {
        this.roomId = this.route.snapshot.paramMap.get('id') || '';
        if (this.roomId) {
            this.playerListService.fetchPlayers(this.roomId);
        }
    }

    toggleRoomLock() {
        this.isRoomLocked = !this.isRoomLocked;
    }
}
