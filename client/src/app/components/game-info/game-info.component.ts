import { Component, Input } from '@angular/core';
import { GameField, MapField, PlayerField } from '@app/pages/play-page/play-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GameTimerComponent } from '@app/components/game-timer/game-timer.component';

@Component({
    selector: 'app-game-info',
    standalone: true,
    imports: [FontAwesomeModule, GameTimerComponent],
    templateUrl: './game-info.component.html',
})
export class GameInfoComponent {
    @Input() mapField!: MapField; // Dans un service
    @Input() playerField!: PlayerField;
    @Input() gameField!: GameField;
}
