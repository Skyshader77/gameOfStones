import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'init-page',
    standalone: true,
    templateUrl: './init-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class InitPageComponent {
    constructor() {}
}
