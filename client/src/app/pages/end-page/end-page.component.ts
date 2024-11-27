import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { StatsGlobalComponent } from '@app/components/stats-global/stats-global.component';
import { StatsPlayerListComponent } from '@app/components/stats-player-list/stats-player-list.component';
import { ADMIN_ICONS } from '@app/constants/admin.constants';
import { Pages } from '@app/constants/pages.constants';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { RefreshService } from '@app/services/utilitary/refresh/refresh.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-end-page',
    standalone: true,
    templateUrl: './end-page.component.html',
    styleUrls: [],
    imports: [FontAwesomeModule, StatsGlobalComponent, StatsPlayerListComponent, ChatComponent],
})
export class EndPageComponent implements OnInit {
    adminIcons = ADMIN_ICONS;

    constructor(
        private gameSocketService: GameLogicSocketService,
        private refreshService: RefreshService,
        private router: Router,
    ) {}

    ngOnInit() {
        if (this.refreshService.wasRefreshed()) {
            this.router.navigate([`/${Pages.Init}`]);
        }
    }

    onLeave() {
        this.gameSocketService.sendPlayerAbandon();
        this.router.navigate([`/${Pages.Init}`]);
    }
}
