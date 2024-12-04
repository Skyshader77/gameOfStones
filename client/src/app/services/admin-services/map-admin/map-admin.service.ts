import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN_MAP_ERROR_TITLE } from '@app/constants/admin.constants';
import { Pages } from '@app/interfaces/pages';
import { MapAPIService } from '@app/services/api-services/map-api/map-api.service';
import { MapListService } from '@app/services/map-list-managing-services/map-list/map-list.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { Map } from '@common/interfaces/map';

@Injectable({
    providedIn: 'root',
})
export class MapAdminService {
    constructor(
        private mapAPIService: MapAPIService,
        private mapListService: MapListService,
        private modalMessageService: ModalMessageService,
        private router: Router,
    ) {}

    editMap(searchedMap: Map) {
        this.mapAPIService.getMapById(searchedMap._id).subscribe({
            next: () => {
                this.router.navigate([`/${Pages.Edit}`, searchedMap._id]);
            },
            error: (error: Error) => {
                this.modalMessageService.showMessage({ title: ADMIN_MAP_ERROR_TITLE.updateMap, content: error.message });
            },
        });
    }

    deleteMap(mapID: string, searchedMap: Map) {
        this.mapAPIService.deleteMap(mapID).subscribe({
            next: () => this.mapListService.deleteMapOnUI(searchedMap),
            error: (error: Error) => {
                this.modalMessageService.showMessage({ title: ADMIN_MAP_ERROR_TITLE.deleteMap, content: error.message });
            },
        });
    }

    toggleVisibilityMap(searchedMap: Map) {
        const updatedMap = { ...searchedMap, isVisible: !searchedMap.isVisible };
        this.mapAPIService.updateMap(true, updatedMap).subscribe({
            next: () => this.mapListService.updateMapOnUI(updatedMap),
            error: (error: Error) => {
                this.modalMessageService.showMessage({ title: ADMIN_MAP_ERROR_TITLE.hideUnhide, content: error.message });
            },
        });
    }
}
