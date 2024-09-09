import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-init-page',
    standalone: true,
    templateUrl: './init-page.component.html',
    styleUrls: ['./init-page.component.scss'],
    imports: [RouterLink],
})
export class InitPageComponent {}
