import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'create-page',
    standalone: true,
    templateUrl: './create-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class CreatePageComponent {
    constructor() {}
}
