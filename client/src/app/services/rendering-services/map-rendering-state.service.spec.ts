import { TestBed } from '@angular/core/testing';

import { MapRenderingStateService } from './map-rendering-state.service';

describe('MapRenderingStateService', () => {
    let service: MapRenderingStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapRenderingStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
