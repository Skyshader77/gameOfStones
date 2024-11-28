import { TestBed } from '@angular/core/testing';

import { RefreshService } from './refresh.service';

describe('RefreshService', () => {
    let service: RefreshService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RefreshService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be down on init', () => {
        expect(service['refreshDetector']).toBeFalse();
    });

    it('should set the detector onSetDetector', () => {
        service.setRefreshDetector();
        expect(service['refreshDetector']).toBeTrue();
    });

    it('should detect a refresh when the detector is down', () => {
        service['refreshDetector'] = false;
        service.wasRefreshed();
        expect(service.wasRefreshed()).toBeTrue();
    });

    it('should not detect a refresh when the detector is up', () => {
        service['refreshDetector'] = true;
        service.wasRefreshed();
        expect(service.wasRefreshed()).toBeFalse();
    });
});
