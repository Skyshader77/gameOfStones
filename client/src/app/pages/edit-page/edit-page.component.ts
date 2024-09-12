import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapComponent } from './map.component';
import { SidebarComponent } from './sidebar.component';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    templateUrl: './edit-page.component.html',
    styleUrls: [],
    imports: [RouterLink, SidebarComponent, MapComponent],
})
export class EditPageComponent {}
