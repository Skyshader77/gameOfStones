import { Component } from '@angular/core';
import { PlayerListService } from '@app/services/room-services/player-list.service';

@Component({
    selector: 'app-player-list',
    standalone: true,
    imports: [],
    templateUrl: './player-list.component.html',
    styleUrls: [],
})
export class PlayerListComponent {
    constructor(protected playerListService: PlayerListService) {}

    removePlayer(id: string): void {
        this.playerListService.playerList = this.playerListService.playerList.filter((player) => player.id !== id);
    }
}
