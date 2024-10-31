import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FightInfoComponent } from '@app/components/fight-info/fight-info.component';
import { GameButtonsComponent } from '@app/components/game-buttons/game-buttons.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { MapComponent } from '@app/components/map/map.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { AvatarChoice, SpriteSheetChoice } from '@app/constants/player.constants';
import { Player, PlayerInGame } from '@app/interfaces/player';
import { Direction } from '@app/interfaces/reachable-tiles';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { D6_DEFENCE_FIELDS, PlayerRole } from '@common/constants/player.constants';

@Component({
    selector: 'app-play-page',
    standalone: true,
    templateUrl: './play-page.component.html',
    styleUrls: [],
    imports: [
        RouterLink,
        GameInfoComponent,
        GameButtonsComponent,
        InventoryComponent,
        CommonModule,
        PlayerInfoComponent,
        PlayerListComponent,
        FightInfoComponent,
        MapComponent,
    ],
})
export class PlayPageComponent implements OnInit, AfterViewInit {
    @ViewChild('abandonModal') abandonModal: ElementRef<HTMLDialogElement>;

    checkboard: string[][] = [];

    private movementService: MovementService = inject(MovementService);

    constructor(
        private router: Router,
        private gameMapService: GameMapService,
        private mapService: MapRenderingStateService,
        private mapAPI: MapAPIService,
        public gameMapInputService: GameMapInputService,
    ) {}

    openAbandonModal() {
        this.abandonModal.nativeElement.showModal();
    }

    closeAbandonModal() {
        this.abandonModal.nativeElement.close();
    }

    confirmAbandon() {
        this.closeAbandonModal();
        this.router.navigate(['/init']);
    }

    ngAfterViewInit() {
        const id = '67202a2059c2f6bea8515d54';

        const player1: PlayerInGame = {
            hp: 1,
            isCurrentPlayer: true,
            isFighting: false,
            movementSpeed: 4,
            currentPosition: { x: 6, y: 6 },
            attack: 1,
            defense: 1,
            inventory: [],
            renderInfo: { spriteSheet: SpriteSheetChoice.FemaleNinja, currentSprite: 1, offset: { x: 0, y: 0 } },
            hasAbandonned: false,
            remainingSpeed: 4,
            dice: D6_DEFENCE_FIELDS,
        };

        const player: Player = {
            playerInGame: player1,
            playerInfo: {
                id: '',
                userName: '',
                avatar: AvatarChoice.AVATAR0,
                role: PlayerRole.HUMAN,
            },
        };

        this.movementService.addNewPlayerMove(player, Direction.UP);
        this.movementService.addNewPlayerMove(player, Direction.DOWN);
        this.movementService.addNewPlayerMove(player, Direction.RIGHT);
        this.movementService.addNewPlayerMove(player, Direction.LEFT);

        const players = [player];
        this.mapService.players = players;
        this.mapAPI.getMapById(id).subscribe((map) => {
            this.gameMapService.map = map;
        });
    }

    ngOnInit(): void {
        this.generateCheckboard();
    }

    generateCheckboard() {
        const rows = 20;
        const cols = 20;

        for (let i = 0; i < rows; i++) {
            const row: string[] = [];
            for (let j = 0; j < cols; j++) {
                if ((i + j) % 2 === 0) {
                    row.push('bg-black');
                } else {
                    row.push('bg-white');
                }
            }
            this.checkboard.push(row);
        }
    }
}
