import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GameChatComponent } from '@app/components/chat/game-chat/game-chat.component';
import { FightInfoComponent } from '@app/components/fight-info/fight-info.component';
import { GameButtonsComponent } from '@app/components/game-buttons/game-buttons.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { GamePlayerListComponent } from '@app/components/game-player-list/game-player-list.component';
import { GameTimerComponent } from '@app/components/game-timer/game-timer.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { ItemDropDecisionComponent } from '@app/components/item-drop-decision/item-drop-decision.component';
import { MapComponent } from '@app/components/map/map.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { LAST_STANDING_MESSAGE, LEFT_ROOM_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { GAME_END_DELAY_MS, KING_RESULT, KING_VERDICT, REDIRECTION_MESSAGE, WINNER_MESSAGE } from '@app/constants/play.constants';
import { AVATAR_PROFILE } from '@app/constants/player.constants';
import { MapMouseEvent } from '@app/interfaces/map-mouse-event';
import { FightSocketService } from '@app/services/communication-services/fight-socket.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { GameStatsStateService } from '@app/services/game-stats-state/game-stats-state.service';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { JournalListService } from '@app/services/journal-service/journal-list.service';
import { MovementService } from '@app/services/movement-service/movement.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { TileInfo } from '@common/interfaces/map';
import { PlayerInfo } from '@common/interfaces/player';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-play-page',
    standalone: true,
    templateUrl: './play-page.component.html',
    styleUrls: [],
    imports: [
        GameInfoComponent,
        GameButtonsComponent,
        InventoryComponent,
        CommonModule,
        PlayerInfoComponent,
        FightInfoComponent,
        MapComponent,
        GameChatComponent,
        GamePlayerListComponent,
        GameTimerComponent,
        MessageDialogComponent,
        ItemDropDecisionComponent,
    ],
})
export class PlayPageComponent implements OnDestroy, OnInit {
    @ViewChild('abandonModal') abandonModal: ElementRef<HTMLDialogElement>;

    @ViewChild('playerInfoModal') playerInfoModal: ElementRef<HTMLDialogElement>;
    @ViewChild('tileInfoModal') tileInfoModal: ElementRef<HTMLDialogElement>;

    playerInfo: PlayerInfo | null;
    tileInfo: TileInfo | null;
    itemDropChoiceActive: boolean = false;
    avatarImagePath: string = '';
    private playerInfoSubscription: Subscription;
    private tileInfoSubscription: Subscription;
    private gameEndSubscription: Subscription;
    private lastStandingSubscription: Subscription;
    private inventoryFullSubscription: Subscription;
    private closeItemDropModaSubscription: Subscription;

    private itemManagerService = inject(ItemManagerService);
    private gameMapInputService = inject(GameMapInputService);
    private gameSocketService = inject(GameLogicSocketService);
    private fightSocketService = inject(FightSocketService);
    private myPlayerService = inject(MyPlayerService);
    private movementService = inject(MovementService);
    private refreshService = inject(RefreshService);
    private modalMessageService = inject(ModalMessageService);
    private journalListService = inject(JournalListService);
    private routerService = inject(Router);
    private debugService = inject(DebugModeService);
    private gameStatsStateService = inject(GameStatsStateService);

    get isInFight(): boolean {
        return this.myPlayerService.isFighting;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent({ key, target }: KeyboardEvent) {
        const tagName = (target as HTMLElement).tagName;
        if (['INPUT', 'TEXTAREA'].includes(tagName) || (target as HTMLElement).isContentEditable) return;

        if (key === 'd') {
            this.debugService.toggleDebug();
        }
    }

    handleMapClick(event: MapMouseEvent) {
        return this.gameMapInputService.onMapClick(event);
    }

    handleMapHover(event: MapMouseEvent) {
        return this.gameMapInputService.onMapHover(event);
    }

    ngOnInit() {
        if (this.refreshService.wasRefreshed()) {
            this.modalMessageService.setMessage(LEFT_ROOM_MESSAGE);
            this.quitGame();
        }
        this.movementService.initialize();
        this.gameSocketService.initialize();
        this.fightSocketService.initialize();
        this.journalListService.startJournal();
        this.debugService.initialize();

        this.inventoryFullSubscription = this.itemManagerService.inventoryFull$.subscribe(() => {
            this.itemDropChoiceActive = true;
        });

        this.closeItemDropModaSubscription = this.itemManagerService.closeItemDropModal$.subscribe(() => {
            this.itemDropChoiceActive = false;
        });
        this.infoEvents();
        this.lastStandingEvent();
        this.endEvent();
    }

    quitGame() {
        this.routerService.navigate(['/end']);
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

    ngOnDestroy() {
        this.movementService.cleanup();
        this.gameSocketService.cleanup();
        this.fightSocketService.cleanup();
        this.journalListService.cleanup();
        this.playerInfoSubscription.unsubscribe();
        this.tileInfoSubscription.unsubscribe();
        this.gameEndSubscription.unsubscribe();
        this.inventoryFullSubscription.unsubscribe();
        this.closeItemDropModaSubscription.unsubscribe();
        this.lastStandingSubscription.unsubscribe();
    }

    closePlayerInfoModal() {
        this.playerInfoModal.nativeElement.close();
    }

    closeTileInfoModal() {
        this.tileInfoModal.nativeElement.close();
    }

    onItemDropSelected() {
        this.itemDropChoiceActive = false;
    }

    private infoEvents() {
        this.playerInfoSubscription = this.gameMapInputService.playerInfoClick$.subscribe((playerInfo: PlayerInfo | null) => {
            this.playerInfo = playerInfo;
            if (!this.playerInfo) return;
            this.avatarImagePath = AVATAR_PROFILE[this.playerInfo.avatar];
            this.playerInfoModal.nativeElement.showModal();
        });

        this.tileInfoSubscription = this.gameMapInputService.tileInfoClick$.subscribe((tileInfo: TileInfo) => {
            this.tileInfo = tileInfo;
            this.tileInfoModal.nativeElement.showModal();
        });
    }

    private lastStandingEvent() {
        this.lastStandingSubscription = this.gameSocketService.listenToLastStanding().subscribe(() => {
            this.modalMessageService.setMessage(LAST_STANDING_MESSAGE);
            this.gameSocketService.sendPlayerAbandon();
            this.routerService.navigate(['/init']);
        });
    }

    private endEvent() {
        this.gameEndSubscription = this.gameSocketService.listenToEndGame().subscribe((endOutput) => {
            const messageTitle =
                endOutput.winnerName === this.myPlayerService.getUserName() ? WINNER_MESSAGE : KING_VERDICT + endOutput.winnerName + KING_RESULT;

            this.modalMessageService.showMessage({
                title: messageTitle,
                content: REDIRECTION_MESSAGE,
            });

            this.gameStatsStateService.gameStats = endOutput.endStats;

            setTimeout(() => {
                this.quitGame();
            }, GAME_END_DELAY_MS);
        });
    }
}
