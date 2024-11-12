import { TestBed } from '@angular/core/testing';

import { MapExportService } from './map-export.service';
import { MOCK_MAPS } from '@app/constants/tests.constants';
import { DOWNLOAD_BLOB_TYPE } from '@app/constants/admin.constants';

describe('MapExportService', () => {
    let service: MapExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MapExportService],
        });
        service = TestBed.inject(MapExportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a blob with JSON content of the map', () => {
        const stringifySpy = spyOn(JSON, 'stringify').and.callThrough();
        const blobSpy = spyOn(window, 'Blob').and.callThrough();
        service.exportMap(MOCK_MAPS[0]);
        expect(stringifySpy).toHaveBeenCalledWith(MOCK_MAPS[0], jasmine.any(Function), 2);
        expect(blobSpy).toHaveBeenCalledWith([jasmine.any(String)], { type: DOWNLOAD_BLOB_TYPE });
    });
});
