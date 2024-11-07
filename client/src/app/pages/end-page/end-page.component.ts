import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameChatComponent } from '@app/components/chat/game-chat/game-chat.component';
import { StatsGlobalComponent } from '@app/components/stats-global/stats-global.component';
import { StatsPlayerListComponent } from '@app/components/stats-player-list/stats-player-list.component';
import { ADMIN_ICONS } from '@app/constants/admin.constants';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-end-page',
    standalone: true,
    templateUrl: './end-page.component.html',
    styleUrls: [],
    imports: [RouterLink, GameChatComponent, FontAwesomeModule, StatsGlobalComponent, StatsPlayerListComponent],
})
export class EndPageComponent {
    adminIcons = ADMIN_ICONS;
}
