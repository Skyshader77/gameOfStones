import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'edit-page',
    standalone: true,
    templateUrl: './edit-page.component.html',
    styleUrls: [],
    imports: [RouterLink],
})
export class EditPageComponent {
    constructor() {}
}
