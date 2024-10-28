import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUTTONS_ICONS } from '@app/constants/game-buttons.constants';
import { PlayerFightInfo } from '@app/pages/play-page/play-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-game-buttons',
    standalone: true,
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './game-buttons.component.html',
})
export class GameButtonsComponent {
    @Input() isInCombat!: boolean; // Dans un service
    @Input() fightField!: PlayerFightInfo;

    @Output() abandon = new EventEmitter<void>();

    buttonIcon = BUTTONS_ICONS;

    abandonGame() {
        this.abandon.emit();
    }
}
