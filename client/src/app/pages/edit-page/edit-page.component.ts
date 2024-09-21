import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameMode } from '@app/interfaces/map';
import { DataConversionService } from '@app/services/edit-page-services/data-conversion.service';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapComponent } from './map.component';
import { SidebarComponent } from './sidebar.component';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    templateUrl: './edit-page.component.html',
    styleUrls: [],
    imports: [SidebarComponent, MapComponent],
})
export class EditPageComponent implements OnInit {
    gameMode: GameMode = GameMode.CTF;
    convertTerrainToString = this.dataConversionService.convertTerrainToString;

    constructor(
        private mapManagerService: MapManagerService,
        private dataConversionService: DataConversionService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        const mapId: string | null = this.route.snapshot.paramMap.get('id');
        this.mapManagerService.onInit(mapId);
    }
}
