import { TestBed } from '@angular/core/testing';

import { MapExportService } from './map-export.service';
import { MOCK_MAPS } from '@app/constants/tests.constants';

describe('MapExportService', () => {
    let service: MapExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapExportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should convert map to JSON correctly', () => {
        const jsonMap = service.convertMapToJson(MOCK_MAPS[0]);
        expect(jsonMap).toBe(JSON.stringify(MOCK_MAPS[0], service['replacer'], 2));
    });
});
