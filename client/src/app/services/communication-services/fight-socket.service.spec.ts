import { TestBed } from '@angular/core/testing';

import { FightSocketService } from './fight-socket.service';

describe('FightSocketService', () => {
    let service: FightSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FightSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
