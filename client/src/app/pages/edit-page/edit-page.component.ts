import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameMode } from '@app/interfaces/map';
import { DataConversionService } from '@app/services/data-conversion.service';
import { EditPageService } from '@app/services/edit-page.service';
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
        private editPageService: EditPageService,
        private dataConversionService: DataConversionService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        const mapId: string | null = this.route.snapshot.paramMap.get('id');
        console.log(mapId);
        this.editPageService.onInit(mapId);
    }
}
