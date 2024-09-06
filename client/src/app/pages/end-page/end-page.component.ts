import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'end-page',
    standalone: true,
    templateUrl: './end-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class EndPageComponent {
    constructor() {}
}
