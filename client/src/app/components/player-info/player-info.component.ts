import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

@Component({
    selector: 'app-player-info',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './player-info.component.html',
    styleUrls: [],
})
export class PlayerInfoComponent {
    constructor(protected myPlayerService: MyPlayerService) {}
}
