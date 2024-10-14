import { AfterViewInit, Component } from '@angular/core';
import { Pathfinding } from '@app/classes/pathfinding';
import { MapComponent } from '@app/components/map/map.component';
import { RASTER_DIMENSION } from '@app/constants/rendering.constants';
import { MapMouseEvent } from '@app/interfaces/map';
import { Avatar, Player, PlayerSprite } from '@app/interfaces/player';
import { ReachableTile } from '@app/interfaces/reachableTiles';
import { Vec2 } from '@app/interfaces/vec2';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { MapRenderingStateService } from '@app/services/map-rendering-state.service';

@Component({
    selector: 'app-map-test',
    standalone: true,
    imports: [MapComponent],
    templateUrl: './map-test.component.html',
    styleUrl: './map-test.component.scss',
})
export class MapTestComponent implements AfterViewInit {
    map: MapComponent;
    currentPlayerIndex: number = 0;

    constructor(
        private mapState: MapRenderingStateService,
        private mapAPI: MapAPIService,
    ) {}

    ngAfterViewInit() {
        console.log('Map Test Component');
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

    convertToTilePosition(position: Vec2) {
        const tileSize: number = RASTER_DIMENSION / this.mapState.map.size;

        return {
            x: Math.floor(position.x / tileSize),
            y: Math.floor(position.y / tileSize),
        };
    }

    onMapClick(event: MapMouseEvent) {
        if (!this.mapState.isMoving) {
            const clickedPosition = this.convertToTilePosition(event.tilePosition);

            const currentPlayer = this.mapState.players[this.currentPlayerIndex];
            const clickedPlayer = this.mapState.players.find(
                (player) => player.position.x === clickedPosition.x && player.position.y === clickedPosition.y,
            );

            if (clickedPlayer === currentPlayer) {
                if (this.mapState.playableTiles.length === 0) {
                    this.mapState.playableTiles = Pathfinding.dijkstraReachableTiles(
                        this.mapState.map.mapArray,
                        currentPlayer.position.x,
                        currentPlayer.position.y,
                        currentPlayer.playerSpeed,
                    );
                }
                return;
            }

            if (this.mapState.playableTiles.length > 0) {
                const playableTile = this.getPlayableTile(clickedPosition);
                if (playableTile) {
                    if (this.doesTileHavePlayer(playableTile)) {
                        playableTile.path.pop();
                        currentPlayer.isInCombat = true;
                    }
                    for (const direction of playableTile.path) {
                        this.mapState.playerMovementsQueue.push({
                            player: currentPlayer,
                            direction: direction,
                        });
                    }
                    this.mapState.players[this.currentPlayerIndex].isPlayerTurn = false;
                    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.mapState.players.length;
                    this.mapState.players[this.currentPlayerIndex].isPlayerTurn = true;
                }
                this.mapState.playableTiles = [];
            }
        }
    }

    doesTileHavePlayer(tile: ReachableTile): boolean {
        for (const player of this.mapState.players) {
            if (player.position.x === tile.x && player.position.y === tile.y) {
                return true;
            }
        }
        return false;
    }

    getPlayableTile(position: Vec2): ReachableTile | null {
        for (const tile of this.mapState.playableTiles) {
            if (tile.x === position.x && tile.y === position.y) {
                return tile;
            }
        }
        return null;
    }

    onMapHover(event: MapMouseEvent) {
        this.mapState.hoveredTile = this.convertToTilePosition(event.tilePosition);
    }
}
