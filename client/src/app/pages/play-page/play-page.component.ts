import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'play-page',
    standalone: true,
    templateUrl: './play-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class PlayPageComponent {
    constructor() {}
}
