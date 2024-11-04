import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GameChatComponent } from '@app/components/chat/game-chat/game-chat.component';
import { FightInfoComponent } from '@app/components/fight-info/fight-info.component';
import { GameButtonsComponent } from '@app/components/game-buttons/game-buttons.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { GamePlayerListComponent } from '@app/components/game-player-list/game-player-list.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { MapComponent } from '@app/components/map/map.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { AvatarChoice, SpriteSheetChoice } from '@app/constants/player.constants';
import { Player, PlayerInGame } from '@app/interfaces/player';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { D6_DEFENCE_FIELDS, PlayerRole } from '@common/constants/player.constants';
import { Direction } from '@common/interfaces/move';
import { Subscription } from 'rxjs';

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
        GamePlayerListComponent,
    ],
})
export class PlayPageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('abandonModal') abandonModal: ElementRef<HTMLDialogElement>;

    isInCombat: boolean = true;

    gameMapInputService = inject(GameMapInputService);
    private timeSubscription: Subscription;
    // private playerPossiblePathListener: Subscription;
    // private playerListService = inject(PlayerListService);
    private gameSocketService = inject(GameLogicSocketService);
    // private myPlayerService = inject(MyPlayerService);
    private router = inject(Router);
    private mapState = inject(MapRenderingStateService);
    private gameTimeService = inject(GameTimeService);
    private movementService: MovementService = inject(MovementService);
    private gameMapService: GameMapService = inject(GameMapService);
    private mapAPI: MapAPIService = inject(MapAPIService);

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
        this.gameSocketService.sendPlayerAbandon();
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
            startPosition: { x: 6, y: 6 },
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
        this.mapState.players = players;
        this.mapAPI.getMapById(id).subscribe((map) => {
            this.gameMapService.map = map;
        });
        this.timeSubscription = this.gameTimeService.listenToRemainingTime();
        // console.log(this.myPlayerService.myPlayer);
    }

    ngOnDestroy() {
        this.timeSubscription.unsubscribe();
    }
}
