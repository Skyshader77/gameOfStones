import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GameChatComponent } from '@app/components/chat/game-chat/game-chat.component';
import { FightInfoComponent } from '@app/components/fight-info/fight-info.component';
import { GameButtonsComponent } from '@app/components/game-buttons/game-buttons.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { MapComponent } from '@app/components/map/map.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { LEFT_ROOM_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
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
        MessageDialogComponent,
    ],
})
export class PlayPageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('abandonModal') abandonModal: ElementRef<HTMLDialogElement>;

    currentPlayerListener: Subscription;

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
    // private myPlayerService = inject(MyPlayerService);
    private rendererState = inject(MapRenderingStateService);
    private movementService = inject(MovementService);
    private refreshService = inject(RefreshService);
    private modalMessageService = inject(ModalMessageService);
    private router = inject(Router);

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
    }

    ngAfterViewInit() {
        if (this.refreshService.wasRefreshed()) {
            this.modalMessageService.setMessage(LEFT_ROOM_MESSAGE);
            this.router.navigate(['/init']);
        }
        this.rendererState.initialize();
        this.movementService.initialize();
        this.gameSocketService.initialize();
    }

    ngOnDestroy() {
        this.rendererState.cleanup();
        this.movementService.cleanup();
        this.gameSocketService.cleanup();
    }
}
