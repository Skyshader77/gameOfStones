import { TestBed } from '@angular/core/testing';

import { FightStateService } from './fight-state.service';

describe('FightStateService', () => {
    let service: FightStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FightStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
