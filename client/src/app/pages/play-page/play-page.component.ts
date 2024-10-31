import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FightInfoComponent } from '@app/components/fight-info/fight-info.component';
import { GameButtonsComponent } from '@app/components/game-buttons/game-buttons.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { MapComponent } from '@app/components/map/map.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { Player } from '@app/interfaces/player';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { GameMapInputService } from '@app/services/game-page-services/game-map-input.service';
import { MapRenderingStateService } from '@app/services/rendering-services/map-rendering-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { GameTimeService } from '@app/services/time-services/game-time.service';
import { Subscription } from 'rxjs';

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
export class PlayPageComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('abandonModal') abandonModal: ElementRef<HTMLDialogElement>;

    checkboard: string[][] = [];

    private timeSubscription: Subscription;
    private playerPossiblePathListener: Subscription;

    constructor(
        private router: Router,
        private mapState: MapRenderingStateService,
        private gameTimeService: GameTimeService,
        public gameMapInputService: GameMapInputService,
        private playerListService: PlayerListService,
        private gameSocketService: GameLogicSocketService,
        private myPlayerService: MyPlayerService,
    ) {}

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
        this.playerListService.playerList.forEach((player: Player) => {
            this.mapState.players.push(player);
        });
        this.timeSubscription = this.gameTimeService.listenToRemainingTime();
        console.log(this.myPlayerService.myPlayer);
    }

    ngOnInit(): void {
        this.generateCheckboard();
        this.playerPossiblePathListener = this.gameSocketService.listenToPossiblePlayerMovement().subscribe((possibleMoves) => {
            this.mapState.playableTiles = possibleMoves;
            console.log(possibleMoves);
        });
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

    ngOnDestroy() {
        this.timeSubscription.unsubscribe();
        this.playerPossiblePathListener.unsubscribe();
    }
}
