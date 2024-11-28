import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { AVATAR_PROFILE } from '@app/constants/player.constants';
import { PlayerRole } from '@common/enums/player-role.enum';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { Player } from '@app/interfaces/player';

@Component({
    selector: 'app-player-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './player-list.component.html',
    styleUrls: [],
})
export class PlayerListComponent implements OnInit, OnDestroy {
    avatars = Object.values(AVATAR_PROFILE);
    playerRole = PlayerRole;

    constructor(
        private playerListService: PlayerListService,
        private myPlayerService: MyPlayerService,
    ) {}

    get playerList() {
        return this.playerListService.playerList;
    }

    isMyName(playerName: string): boolean {
        return this.myPlayerService.getUserName() === playerName;
    }

    canKickPlayer(player: Player): boolean {
        return player.playerInfo.role !== PlayerRole.Organizer && this.myPlayerService.isOrganizer();
    }

    onKick(playerName: string) {
        this.playerListService.askPlayerRemovalConfirmation(playerName);
    }

    ngOnInit(): void {
        this.playerListService.initialize();
    }

    ngOnDestroy(): void {
        this.playerListService.cleanup();
    }
}
