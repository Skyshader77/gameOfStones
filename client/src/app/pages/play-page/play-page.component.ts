import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GameChatComponent } from '@app/components/chat/game-chat/game-chat.component';
import { FightInfoComponent } from '@app/components/fight-info/fight-info.component';
import { GameButtonsComponent } from '@app/components/game-buttons/game-buttons.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { MapComponent } from '@app/components/map/map.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
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
    ],
})
export class PlayPageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('abandonModal') abandonModal: ElementRef<HTMLDialogElement>;

    currentPlayerListener: Subscription;
    possibleMovementsListener: Subscription;

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

    gameMapInputService = inject(GameMapInputService);
    private gameSocketService = inject(GameLogicSocketService);
    private playerListService = inject(PlayerListService);
    // private myPlayerService = inject(MyPlayerService);
    private router = inject(Router);
    private rendererState = inject(MapRenderingStateService);
    private movementService = inject(MovementService);

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
        this.currentPlayerListener = this.playerListService.listenCurrentPlayer();
        this.rendererState.initialize();
        this.movementService.initialize();
        // console.log(this.myPlayerService.myPlayer);
    }

    ngOnDestroy() {
        this.currentPlayerListener.unsubscribe();
        this.possibleMovementsListener.unsubscribe();
        this.rendererState.cleanup();
        this.movementService.cleanup();
    }
}
