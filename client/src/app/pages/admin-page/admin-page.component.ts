import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'admin-page',
    standalone: true,
    templateUrl: './admin-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class AdminPageComponent {
    constructor() {}
}
