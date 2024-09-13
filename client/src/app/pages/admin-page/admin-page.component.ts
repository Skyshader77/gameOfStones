import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faEdit, faFileExport, faFileImport, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { Map } from 'src/app/interfaces/map';
import { MapAPIService } from 'src/app/services/map-api.service';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    imports: [RouterLink, FontAwesomeModule, NgFor, NgIf],
})
export class AdminPageComponent implements OnInit {
    faEdit = faEdit;
    faExport = faFileExport;
    faDelete = faX;
    faBackward = faBackward;
    faFileImport = faFileImport;
    faPlus = faPlus;
    maps: Map[] = [];
    selectedMap: Map | null = null;
    showDescription: boolean = false;
    constructor(private mapAPIService: MapAPIService) {}

    ngOnInit(): void {
        this.getMaps();
    }

    getMaps(): void {
        this.mapAPIService.getMaps().subscribe((maps) => (this.maps = maps));
    }

    delete(searchedMap: Map): void {
        this.maps = this.maps.filter((map) => map !== searchedMap);
        this.mapAPIService.deleteMap(searchedMap._id).subscribe();
    }

    modifyMap(searchedMap: Map): void {
        this.mapAPIService.updateMap(searchedMap._id, searchedMap).subscribe();
    }

    toggleVisibility(map: Map): void {
        const updatedMap = { ...map, isVisible: !map.isVisible };
        this.mapAPIService.updateMap(map._id, updatedMap).subscribe(() => {
            this.maps = this.maps.map((m) => (m._id === map._id ? updatedMap : m));
        });
    }

    selectMap(map: Map): void {
        this.selectedMap = map;
    }
}
