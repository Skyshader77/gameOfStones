import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FightInfoComponent } from '@app/components/fight-info/fight-info.component';
import { GameButtonsComponent } from '@app/components/game-buttons/game-buttons.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';

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
    ],
})
export class PlayPageComponent implements OnInit {
    @ViewChild('abandonModal') abandonModal: ElementRef<HTMLDialogElement>;

    checkboard: string[][] = [];

    constructor(private router: Router) {}

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
