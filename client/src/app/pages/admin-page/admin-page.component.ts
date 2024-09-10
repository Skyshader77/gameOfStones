import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faEdit, faFileExport, faFileImport, faPlus, faX } from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'app-admin-page',
    standalone: true,
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    imports: [RouterLink, FontAwesomeModule],
})
export class AdminPageComponent {
    constructor() {
        
    }
    faEdit = faEdit;
    faExport =faFileExport ;
    faDelete=faX;
    faBackward=faBackward;
    faFileImport=faFileImport;
    faPlus=faPlus;
}
