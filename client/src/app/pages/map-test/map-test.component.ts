import { AfterViewInit, Component } from '@angular/core';
import { MapComponent } from '@app/components/map/map.component';
import { SpriteSheetChoice } from '@app/constants/player.constants';
import { PlayerInGame } from '@app/interfaces/player';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { D6_DEFENCE_FIELDS } from '@common/interfaces/player.constants';

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
        const player1: PlayerInGame = {
            hp: 1,
            isCurrentPlayer: true,
            isFighting: false,
            movementSpeed: 4,
            currentPosition: { x: 6, y: 6 },
            attack: 1,
            defense: 1,
            inventory: [],
            renderInfo: { spriteSheet: SpriteSheetChoice.NINJA_DOWN, offset: { x: 0, y: 0 } },
            hasAbandonned: false,
            dice: D6_DEFENCE_FIELDS,
        };

        const players = [player1];
        this.mapState.players = players;
        this.mapAPI.getMapById(id).subscribe((map) => {
            this.mapState.map = map;
        });
    }
}
