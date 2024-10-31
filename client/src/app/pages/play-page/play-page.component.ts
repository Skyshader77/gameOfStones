import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GameChatComponent } from '@app/components/chat/game-chat/game-chat.component';
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

// À RETIRER DANS LE FUTUR
export interface PlayerFightInfo {
    diceResult: number;
    numberEscapesRemaining: number;
}
// À RETIRER DANS LE FUTUR
export interface PlayerField {
    name: string;
    avatar: string;
} // À RETIRER DANS LE FUTUR
export interface MapField {
    size: string;
} // À RETIRER DANS LE FUTUR
export interface GameField {
    numberPlayer: number;
}
// À RETIRER DANS LE FUTUR
export interface PlayerInfoField {
    name: string;
    avatar: string;
    hp: number;
    hpMax: number;
    speed: number;
    attack: number;
    defense: number;
    d6Bonus: number;
    movementPoints: number;
    numberOfActions: number;
}
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
        GameChatComponent,
    ],
})
export class PlayPageComponent implements AfterViewInit {
    @ViewChild('abandonModal') abandonModal: ElementRef<HTMLDialogElement>;

    // À RETIRER DANS LE FUTUR  : utiliser pour fightInfo et condition pour activé le bouton évasion
    fightField: PlayerFightInfo = { diceResult: 0, numberEscapesRemaining: 3 };

    // À RETIRER DANS LE FUTUR pour gameInfo
    mapField: MapField = { size: '20 x 20' };
    // À RETIRER DANS LE FUTUR pour gameInfo
    playerField: PlayerField = { name: 'John Doe', avatar: 'assets/avatar/goat.jpg' };
    // À RETIRER DANS LE FUTUR pour gameInfo
    gameField: GameField = { numberPlayer: 6 };

    // À RETIRER DANS LE FUTUR pour playerInfo
    playerInfoField: PlayerInfoField = {
        name: 'Beau Gosse',
        avatar: 'assets/avatar/goat.jpg',
        hp: 2,
        hpMax: 4,
        speed: 4,
        attack: 4,
        defense: 4,
        d6Bonus: 0,
        movementPoints: 3,
        numberOfActions: 1,
    };

    isInCombat: boolean = true;

    private movementService: MovementService = inject(MovementService);

    constructor(
        private router: Router,
        private gameMapService: GameMapService,
        private mapService: MapRenderingStateService,
        private mapAPI: MapAPIService,
        public gameMapInputService: GameMapInputService,
    ) {}

    toggleCombat() {
        this.isInCombat = !this.isInCombat;
    }

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
            remainingMovement: 4,
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
}
