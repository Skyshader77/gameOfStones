import { TestBed } from '@angular/core/testing';

import { RenderingStateService } from './rendering-state.service';

describe('RenderingStateService', () => {
    let service: RenderingStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RenderingStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
