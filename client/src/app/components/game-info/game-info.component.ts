import { Component } from '@angular/core';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';

@Component({
    selector: 'app-game-info',
    standalone: true,
    imports: [],
    templateUrl: './game-info.component.html',
})
export class GameInfoComponent {
    constructor(
        protected gameMapService: GameMapService,
        protected playerListService: PlayerListService,
    ) {}
}
