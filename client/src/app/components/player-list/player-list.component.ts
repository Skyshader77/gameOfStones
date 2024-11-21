import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { AVATAR_PROFILE } from '@app/constants/player.constants';
import { PlayerRole } from '@common/enums/player-role.enum';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';

@Component({
    selector: 'app-player-list',
    standalone: true,
    imports: [],
    templateUrl: './player-list.component.html',
    styleUrls: [],
})
export class PlayerListComponent implements OnInit, OnDestroy {
    avatars = Object.values(AVATAR_PROFILE);
    playerRole = PlayerRole;

    constructor(
        protected playerListService: PlayerListService,
        public myPlayerService: MyPlayerService,
    ) {}

    ngOnInit(): void {
        this.playerListService.initialize();
    }

    ngOnDestroy(): void {
        this.playerListService.cleanup();
    }
}
