import { TestBed } from '@angular/core/testing';

import { MapExportService } from './map-export.service';

describe('MapExportService', () => {
    let service: MapExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapExportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
