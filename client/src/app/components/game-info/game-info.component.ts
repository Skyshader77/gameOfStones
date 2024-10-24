import { Component, Input } from '@angular/core';
import { GameField, MapField, PlayerField } from '@app/pages/play-page/play-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-game-info',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './game-info.component.html',
})
export class GameInfoComponent {
    @Input() mapField!: MapField;
    @Input() playerField!: PlayerField;
    @Input() gameField!: GameField;
}
