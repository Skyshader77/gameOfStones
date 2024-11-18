import { TestBed } from '@angular/core/testing';
import { MapExportService } from './map-export.service';
import { MOCK_MAPS } from '@app/constants/tests.constants';
import { DOWNLOAD_BLOB_TYPE, DOWNLOAD_ANCHOR, DOWNLOAD_MAP_PREFIX, DOWNLOAD_MAP_SUFFIX } from '@app/constants/admin.constants';

describe('MapExportService', () => {
    let service: MapExportService;
    let createElementSpy: jasmine.Spy;
    let urlCreateObjectSpy: jasmine.Spy;
    let urlRevokeObjectSpy: jasmine.Spy;
    let mockAnchorElement: any;

    beforeEach(() => {
        mockAnchorElement = {
            href: '',
            download: '',
            click: jasmine.createSpy('click')
        };

        createElementSpy = spyOn(document, 'createElement').and.returnValue(mockAnchorElement);
        urlCreateObjectSpy = spyOn(URL, 'createObjectURL').and.returnValue('mock-blob-url');
        urlRevokeObjectSpy = spyOn(URL, 'revokeObjectURL');

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

    it('should properly set up and trigger the download', () => {
        const mockMap = MOCK_MAPS[0];
        
        service.exportMap(mockMap);
        expect(createElementSpy).toHaveBeenCalledWith(DOWNLOAD_ANCHOR);
        expect(mockAnchorElement.download).toBe(`${DOWNLOAD_MAP_PREFIX}${mockMap.name}${DOWNLOAD_MAP_SUFFIX}`);
        expect(urlCreateObjectSpy).toHaveBeenCalled();
        expect(mockAnchorElement.href).toBe('mock-blob-url');
        expect(mockAnchorElement.click).toHaveBeenCalled();
        expect(urlRevokeObjectSpy).toHaveBeenCalledWith('mock-blob-url');
    });
});