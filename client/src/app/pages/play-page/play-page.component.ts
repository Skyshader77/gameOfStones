import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild, OnInit } from '@angular/core';
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
import { AVATAR_PROFILE } from '@app/constants/player.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { FightSocketService } from '@app/services/communication-services/fight-socket.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { TileInfo } from '@common/interfaces/map';
import { PlayerInfo } from '@common/interfaces/player';
import { Subscription } from 'rxjs';

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
export class PlayPageComponent implements AfterViewInit, OnDestroy, OnInit {
    @ViewChild('abandonModal') abandonModal: ElementRef<HTMLDialogElement>;
    @ViewChild('playerInfoModal') playerInfoModal: ElementRef<HTMLDialogElement>;
    @ViewChild('tileInfoModal') tileInfoModal: ElementRef<HTMLDialogElement>;
    currentPlayerListener: Subscription;

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
    playerInfo: PlayerInfo | null;
    tileInfo: TileInfo | null;
    avatarImagePath: string = '';
    gameMapInputService = inject(GameMapInputService);
    private gameSocketService = inject(GameLogicSocketService);
    private fightSocketService = inject(FightSocketService);
    private myPlayerService = inject(MyPlayerService);
    private rendererState = inject(MapRenderingStateService);
    private movementService = inject(MovementService);
    private refreshService = inject(RefreshService);
    private modalMessageService = inject(ModalMessageService);
    private journalListService = inject(JournalListService);
    private routerService = inject(Router);

    ngOnInit() {

        // Subscribe to player info right-click event
        this.gameMapInputService.playerInfoClick$.subscribe((playerInfo: PlayerInfo | null) => {
            this.playerInfo = playerInfo;
            if (!this.playerInfo) return;
            this.avatarImagePath = AVATAR_PROFILE[this.playerInfo.avatar];
            this.playerInfoModal.nativeElement.showModal();
        });

        // Subscribe to tile info right-click event
        this.gameMapInputService.tileInfoClick$.subscribe((tileInfo: TileInfo) => {
            this.tileInfo = tileInfo;
            this.tileInfoModal.nativeElement.showModal();
        });
    }
    toggleCombat() {
        this.isInCombat = !this.isInCombat;
    }
    get isInFight(): boolean {
        return this.myPlayerService.isFighting;
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
        this.routerService.navigate(['/init']);
    }

    ngAfterViewInit() {
        if (this.refreshService.wasRefreshed()) {
            this.modalMessageService.setMessage(LEFT_ROOM_MESSAGE);
            this.routerService.navigate(['/init']);
        }
        this.rendererState.initialize();
        this.movementService.initialize();
        this.gameSocketService.initialize();
        this.fightSocketService.initialize();
        this.journalListService.startJournal();
    }

    ngOnDestroy() {
        this.rendererState.cleanup();
        this.movementService.cleanup();
        this.gameSocketService.cleanup();
        this.fightSocketService.cleanup();
    }
    closePlayerInfoModal() {
        this.playerInfoModal.nativeElement.close();
    }

    closeTileInfoModal() {
        this.tileInfoModal.nativeElement.close();
    }
}
