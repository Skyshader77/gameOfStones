import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameButtonsComponent } from '@app/components/game-buttons/game-buttons.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { FightInfoComponent } from '../../components/fight-info/fight-info.component';
import { PlayersListComponent } from '../../components/players-list/players-list.component';

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
        PlayersListComponent,
        PlayersListComponent,
        FightInfoComponent,
    ],
})
export class PlayPageComponent implements OnInit {
    Math: any;
    damier: string[][] = [];

    ngOnInit(): void {
        this.generateDamier();
    }

    generateDamier() {
        const rows = 20;
        const cols = 20;

        for (let i = 0; i < rows; i++) {
            const row: string[] = [];
            for (let j = 0; j < cols; j++) {
                // Alternance des couleurs en fonction de la ligne et de la colonne
                if ((i + j) % 2 === 0) {
                    row.push('bg-black');
                } else {
                    row.push('bg-white');
                }
            }
            this.damier.push(row);
        }
    }
}
