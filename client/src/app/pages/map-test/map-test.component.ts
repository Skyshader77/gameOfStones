import { AfterViewInit, Component } from '@angular/core';
import { MapComponent } from '@app/components/map/map.component';
import { Avatar, Player, PlayerSprite } from '@app/interfaces/player';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';

@Component({
    selector: 'app-map-test',
    standalone: true,
    imports: [MapComponent],
    templateUrl: './map-test.component.html',
})
export class MapTestComponent implements AfterViewInit {
    map: MapComponent;
    currentPlayerIndex: number = 0;

    constructor(
        private mapState: MapRenderingStateService,
        private mapAPI: MapAPIService,
        public gameMapInputService: GameMapInputService,
    ) {}

    ngAfterViewInit() {
        const id = '670d940bf9a420640d8cab8c';
        const player1: Player = {
            _id: '1',
            name: 'Player 1',
            position: { x: 6, y: 6 },
            offset: { x: 0, y: 0 },
            avatar: Avatar.NINJA,
            isPlayerTurn: true,
            playerSpeed: 4,
            isInCombat: false,
            playerSprite: PlayerSprite.NINJA_DOWN,
        };

        const player2: Player = {
            _id: '2',
            name: 'Player 2',
            position: { x: 9, y: 6 },
            offset: { x: 0, y: 0 },
            avatar: Avatar.NINJA,
            isPlayerTurn: false,
            playerSpeed: 4,
            isInCombat: false,
            playerSprite: PlayerSprite.NINJA_DOWN,
        };

        const player3: Player = {
            _id: '3',
            name: 'Player 3',
            position: { x: 12, y: 6 },
            offset: { x: 0, y: 0 },
            avatar: Avatar.NINJA,
            isPlayerTurn: false,
            playerSpeed: 4,
            isInCombat: false,
            playerSprite: PlayerSprite.NINJA_DOWN,
        };

        const players = [player1, player2, player3];
        this.mapState.players = players;
        this.mapAPI.getMapById(id).subscribe((map) => {
            this.mapState.map = map;
        });
    }
}
