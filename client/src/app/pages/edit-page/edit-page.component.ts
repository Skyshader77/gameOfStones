import { Component } from '@angular/core';
import { GameMode } from '@app/interfaces/map';
import { DataConversionService } from '../../services/data-conversion.service';
import { EditPageService } from '../../services/edit-page.service';
import { MapComponent } from './map.component';
import { SidebarComponent } from './sidebar.component';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    templateUrl: './edit-page.component.html',
    styleUrls: [],
    imports: [SidebarComponent, MapComponent],
})
export class EditPageComponent {
    gameMode: GameMode = GameMode.CTF;
    convertTerrainToString = this.dataConversionService.convertTerrainToString;

    constructor(
        private editPageService: EditPageService,
        private dataConversionService: DataConversionService,
    ) {}

    ngOnInit() {
        this.editPageService.initializeMap();
    }
}
