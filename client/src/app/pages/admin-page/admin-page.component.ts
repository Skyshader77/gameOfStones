import { NgFor, NgIf, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBackward, faEdit, faFileExport, faFileImport, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { Map } from 'src/app/interfaces/map';
import { MapAPIService } from 'src/app/services/map-api.service';
import { FIVE_SECONDS } from 'src/app/constants/admin-API.constants';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    templateUrl: './admin-page.component.html',
    imports: [RouterLink, FontAwesomeModule, NgFor, NgIf, NgClass],
})
export class AdminPageComponent implements OnInit {
    faEdit = faEdit;
    faExport = faFileExport;
    faDelete = faX;
    faBackward = faBackward;
    faFileImport = faFileImport;
    faPlus = faPlus;
    maps: Map[] = [];
    alertMessage: string | null = null;
    alertType: 'success' | 'error' | null = null;
    selectedMap: Map | null = null;
    showDescription: boolean = false;
    constructor(
        private mapAPIService: MapAPIService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.getMaps();
    }

    getMaps(): void {
        this.mapAPIService.getMaps().subscribe((maps) => (this.maps = maps));
    }

    delete(searchedMap: Map): void {
        this.maps = this.maps.filter((map) => map !== searchedMap);
        this.mapAPIService.deleteMap(searchedMap._id).subscribe({
            next: () => {
                this.alertMessage = 'Map has been successfully deleted!';
                this.alertType = 'success';
                this.clearAlertAfterDelay();
            },
            error: () => {
                this.alertMessage = 'Error! Map could not be found.';
                this.alertType = 'error';
                this.clearAlertAfterDelay();
            },
        });
    }

    goToEditMap(searchedMap: Map): void {
        this.router.navigate(['/edit'], { state: { searchedMap } });
    }

    modifyMap(searchedMap: Map): void {
        this.mapAPIService.updateMap(searchedMap._id, searchedMap).subscribe();
    }

    toggleVisibility(map: Map): void {
        const updatedMap = { ...map, isVisible: !map.isVisible };
        this.mapAPIService.updateMap(map._id, updatedMap).subscribe({
            next: () => {
                this.maps = this.maps.map((m) => (m._id === map._id ? updatedMap : m));
            },
            error: () => {
                this.alertMessage = 'Error! Map visibility could not be updated.';
                this.alertType = 'error';
            },
        });
    }

    selectMap(map: Map): void {
        this.selectedMap = map;
    }

    private clearAlertAfterDelay(): void {
        setTimeout(() => {
            this.alertMessage = '';
            this.alertType = null;
        }, FIVE_SECONDS);
    }
}
