import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'lobby-page',
    standalone: true,
    templateUrl: './lobby-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class LobbyPageComponent {
    constructor() {}
}
